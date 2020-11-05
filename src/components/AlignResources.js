import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { faEllipsisV, faUsers, faLock } from '@fortawesome/free-solid-svg-icons';
import courseSections  from './Data/courseSections.json';
import courseInfo  from './Data/courseInfo.json';
import teacherInfo  from './Data/teacherInfo.json';
import classroomInfo  from './Data/classroomInfo.json';
import studentInfo  from './Data/studentInfo.json';
import teacherSchedules from './Data/teacherSchedules.json';
import classroomSchedules from './Data/classroomSchedules.json';
import studentSchedules from './Data/studentSchedules.json';
import schoolClassroomTypes  from './Data/schoolClassroomTypes.json';
import schoolDepartments from './Data/schoolDepartments.json';
import colorMap from './Data/colorMap.json';

var tableViews = {
  teacher: {
    titles: [],
    columns: {}
  },
  classroom: {
    titles: [],
    columns: {}
  },
  student: {
    titles: [],
    columns: {}
  }
}

Object.keys(schoolDepartments).map((s_key, s_index) => {
  var department = schoolDepartments[s_key];
  Object.keys(teacherInfo).map((t_key, t_index) => {
    var teacher = teacherInfo[t_key];
    if(teacher['department'] === department) {
      tableViews['teacher']['titles'].push(teacher);
      var periods = teacherSchedules[t_key]['periods'];
      Object.keys(periods).map((p_key, p_index) => {
        var c_key = t_key + '-' + p_key;          
        tableViews['teacher']['columns'][c_key] = {
          id: c_key,
          list: periods[p_key]
        }
      });
    }
  })
});

Object.keys(studentInfo).map((t_key, t_index) => {
  var student = studentInfo[t_key];      
  tableViews['student']['titles'].push(student);
  if (t_key in studentSchedules) {
    var periods = studentSchedules[t_key]['periods'];
    Object.keys(periods).map((p_key, p_index) => {
      var c_key = t_key + '-' + p_key;
      tableViews['student']['columns'][c_key] = {
        id: c_key,
        list: periods[p_key]
      }
    });
  }
});

Object.keys(classroomInfo).map((t_key, t_index) => {
  var classroom = classroomInfo[t_key];
  tableViews['classroom']['titles'].push(classroom);
  var periods = classroomSchedules[t_key];
  Object.keys(periods).map((p_key, p_index) => {
    var c_key = t_key + '-' + p_key;
    tableViews['classroom']['columns'][c_key] = {
      id: c_key,
      list: periods[p_key]
    }
  });
});

export default function App () {
  var initialColumns = {
    // todo: {
    //   id: 'todo',
    //   list: ['item 1', 'item 2', 'item 3']
    // },
  }

  const headers = [
    'Period1', 'Period2', 'Period3', 'Period4-5', 'Period5-6', 'Period6-7',
    'Period7-8', 'Period8-9', 'Period9-10', 'Period11', 'Period12'
  ];

  const [activeView, setActiveView] = useState('teacher');

  const [matchRate, setMatchRate] = useState(94.21);

  const [columns, setColumns] = useState(tableViews['teacher']['columns']);

  const handleChangeView = (view) => {
    setActiveView(view);
    setColumns(tableViews[view]['columns']);
  }

  const onDragEnd = ({ source, destination }: DropResult) => {
    // calculate match Rate.
    setMatchRate((Math.random()*100).toFixed(2));
    
    // Make sure we have a valid destination
    if (destination === undefined || destination === null) return null

    // Make sure we're actually moving the item
    if (
      source.droppableId === destination.droppableId &&
      destination.index === source.index
    )
      return null

    // Set start and end variables
    const start = columns[source.droppableId]
    const end = columns[destination.droppableId]

    // If start is the same as end, we're in the same column
    if (start === end) {
      // Move the item within the list
      // Start by making a new list without the dragged item
      const newList = start.list.filter(
        (_: any, idx: number) => idx !== source.index
      )

      // Then insert the item at the right location
      newList.splice(destination.index, 0, start.list[source.index])

      // Then create a new copy of the column object
      const newCol = {
        id: start.id,
        list: newList
      }

      // Update the state
      setColumns(state => ({ ...state, [newCol.id]: newCol }))
      return null
    } else {
      // If start is different from end, we need to update multiple columns
      // Filter the start list like before
      const newStartList = start.list.filter(
        (_: any, idx: number) => idx !== source.index
      )

      // Create a new start column
      const newStartCol = {
        id: start.id,
        list: newStartList
      }

      // Make a new end list array
      const newEndList = end.list

      // Insert the item into the end list
      newEndList.splice(destination.index, 0, start.list[source.index])

      // Create a new end column
      const newEndCol = {
        id: end.id,
        list: newEndList
      }

      // Update the state
      setColumns(state => ({
        ...state,
        [newStartCol.id]: newStartCol,
        [newEndCol.id]: newEndCol
      }))
      return null
    }
  }

  return (    
    <div id="assign-resources-main-container">
      <div className="schedule-top">
        <div className="schedule-title">Schedule1</div>
        <div className="match-rate">Match: {matchRate}%</div>
      </div>
      <div className="schedule-toolbar">
        <input className="search" placeholder={`Search by ${activeView}`} />
        <div className="view-mode">
          {
            Object.keys(tableViews).map((key, index) => {              
              return (
                <div key={index}
                  className={`view-item ${activeView === key && 'active'}`} 
                  onClick={() => handleChangeView(key)} >
                  {key} View
                </div>
              )
            })
          }      
        </div>
      </div>
      <div className="schedule-header">
        <div className="header-title h-type">{activeView}</div>
        <div className="header-month">
          {
            headers.map((header, index) => {
              return (
                <div className="header-title" key={index}>{header}</div>
              )
            })
          }
        </div>
      </div>
      <div className="schedule-body">
        <div className="left-panel">
          {
            tableViews[activeView]['titles'].map((view, index) => {              
              return (
                <div className="h-type-value " key={index}>
                  { activeView === 'teacher' && 
                    <div className={ colorMap[view["department"]] }>{view.last_name} {view.first_name}</div>
                  }
                  { activeView === 'classroom' && 
                    <div className={ colorMap[view["department"]] }>{view.classroom_name}</div>
                  }
                  { activeView === 'student' && 
                    <div className='st-view'>                      
                      <div class='student-status'></div>
                      {view.last_name} {view.first_name}
                    </div>
                  }
                </div>
              )              
            })
          }
        </div>
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="main-panel">
            {Object.values(columns).map(col => (
              <Column col={col} key={col.id} activeView={activeView}/>
            ))}
          </div>
        </DragDropContext>
      </div>      
    </div>
  )
}


function Column({ col: { list, id }, activeView: activeView }) {  
  return (
    <Droppable droppableId={id}>
      {(provided) => (
        <div className="main-cell">          
          <div className="main-body" {...provided.droppableProps} ref={provided.innerRef}>
            {list.map((text, index) => {
              if (activeView === 'student')
                return (
                  <ItemStudent key={text.section_id+'-'+text.course_id} id={id} text={text} index={index} />
                )
              else
                return (
                  <Item key={text} text={text} id={id} index={index} />
                )
              }
            )}
            {provided.placeholder}
          </div>
        </div>
      )}
    </Droppable>
  );
};


function ItemStudent ({ text, index, id }) {
  return (
    <Draggable draggableId={id+'-'+text.section_id+'-'+text.course_id} index={index}>
      {provided => {
        var courseSection = courseSections[text.section_id];
        var highlight = courseSection["class_type"] === "semester" && "mi-semester";
        return (
          <div className={`main-item ${highlight}`}
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <div className="main-section">
              { courseSection['class_type'] === 'semester' && 
                <div className="mi-teachername">{courseSection["semester"]}</div>
              }
              <div className="mi-coursename">{courseSection["course_name"]}</div>
              <div className="mi-coursecount">{courseSection["classroom_name"]}</div>
            </div>
          </div>
        )
      }}
    </Draggable>
  )
}

function Item ({ text, index, id }) {
  return (
    <Draggable draggableId={id+'-'+text} index={index}>
      {provided => {
        var courseSection = courseSections[text];
        var highlight = courseSection["class_type"] === "semester" && "mi-semester";
        return (
          <div className={`main-item ${highlight}`}
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <FontAwesomeIcon className='x-ellipsis' icon={faEllipsisV}/>
            <div className="mi-coursename">{courseSection["course_name"]}</div>
            <div className="mi-teachername">{courseSection["teacher_name"]}</div>
            <div className="mi-coursecount">
              <FontAwesomeIcon className='x-user mr-1' icon={faUsers}/>
              <span>{courseSection["student_list"].length}</span>
            </div>
            {courseSection['locked'] == 0 && (
              <div className="mi-lock">
                <FontAwesomeIcon className='x-lock' icon={faLock}/>
              </div>
            )}
          </div>
        )
      }}
    </Draggable>
  )
}