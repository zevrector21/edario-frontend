import React, { useState , useEffect , useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCheck, faEdit, faPlus, faSave, faRedo, faUserCircle, faCheckCircle, faHourglassHalf, faAngleDown, faAngleUp, faSearch } from '@fortawesome/free-solid-svg-icons';
import { WithContext as ReactTags } from 'react-tag-input';

// dummy data for API response

var DEPARTMENTS = [
	{
		department_id: 1,
		department: "Math",
		sections: [
			{
				teacher_id: 2,
				course_id: 1,
				labels : ["bilingual"]
		 	},
		 	{
				teacher_id: 2,
				course_id: 2,
				labels : []
			}
		]
	},
	{
		department_id: 2,
		department: "Politics",
		sections: [
			{
				teacher_id: 3,
				course_id: 3,
				labels : ["bilingual"]
		 	},
		 	{
				teacher_id: 3,
				course_id: 4,
				labels : []
			}
		]
	},
	{
		department_id: 3,
		department: "Philosopia",
		sections: [
			{
				teacher_id: 4,
				course_id: 5,
				labels : ["bilingual"]
		 	},
		 	{
				teacher_id: 5,
				course_id: 6,
				labels : []
			}
		]
	}
];

var TEACHERS = {
	1: {
		departments: [1, 2, 3],
		first_name: "Narae",
		name: "Lee",
		teacher_id: 1
 	},	
 	2: {
		departments: [1, 2, 3],
		first_name: "David",
		name: "Martin",
		teacher_id: 2
 	},	
 	3: {
		departments: [1, 2, 3],
		first_name: "John",
		name: "Davis",
		teacher_id: 3
 	}, 	
 	4: {
		departments: [1, 2, 3],
		first_name: "Xavier",
		name: "Brown",
		teacher_id: 4
 	},	
 	5: {
		departments: [1, 2, 3],
		first_name: "Justin",
		name: "Garrido",
		teacher_id: 5
 	}, 	
}

var COURSES = {	
	1: {
		classroom_type: "None",
		course_code: "0115",
		course_id: 1,
		departments: [1],
		elective: "0",
		is_outside_course: "0",
		is_separate_lab: "0",
		is_special_ed: "0",
		is_swappable_for_lab: "0",
		linked: "0",
		max_class_size: "28",
		max_num_sections: "0",
		name: "Course 1",
		num_periods_spanned: "1",
		semester: "FY"
	},	
	2: {
		classroom_type: "None",
		course_code: "0115",
		course_id: 2,
		departments: [1],
		elective: "0",
		is_outside_course: "0",
		is_separate_lab: "0",
		is_special_ed: "0",
		is_swappable_for_lab: "0",
		linked: "0",
		max_class_size: "28",
		max_num_sections: "0",
		name: "Course 2",
		num_periods_spanned: "1",
		semester: "FY"
	},	
	3: {
		classroom_type: "None",
		course_code: "0115",
		course_id: 3,
		departments: [2],
		elective: "0",
		is_outside_course: "0",
		is_separate_lab: "0",
		is_special_ed: "0",
		is_swappable_for_lab: "0",
		linked: "0",
		max_class_size: "28",
		max_num_sections: "0",
		name: "Course 3",
		num_periods_spanned: "1",
		semester: "FY"
	},	
	4: {
		classroom_type: "None",
		course_code: "0115",
		course_id: 4,
		departments: [2],
		elective: "0",
		is_outside_course: "0",
		is_separate_lab: "0",
		is_special_ed: "0",
		is_swappable_for_lab: "0",
		linked: "0",
		max_class_size: "28",
		max_num_sections: "0",
		name: "Course 4",
		num_periods_spanned: "1",
		semester: "FY"
	},
	5: {
		classroom_type: "None",
		course_code: "0115",
		course_id: 5,
		departments: [3],
		elective: "0",
		is_outside_course: "0",
		is_separate_lab: "0",
		is_special_ed: "0",
		is_swappable_for_lab: "0",
		linked: "0",
		max_class_size: "28",
		max_num_sections: "0",
		name: "Course 5",
		num_periods_spanned: "1",
		semester: "FY"
	},
	6: {
		classroom_type: "None",
		course_code: "0115",
		course_id: 6,
		departments: [3],
		elective: "0",
		is_outside_course: "0",
		is_separate_lab: "0",
		is_special_ed: "0",
		is_swappable_for_lab: "0",
		linked: "0",
		max_class_size: "28",
		max_num_sections: "0",
		name: "Course 6",
		num_periods_spanned: "1",
		semester: "FY"
	}	
}

export default function ConfirmResources() {

	const ref = useRef();

	const userRole = 'admin';

	const userPermission = [1, 2];

	const [dataVersionID, setDataVersionID] = useState(null);

	const [departments, setDepartments] = useState(DEPARTMENTS);

	const [currentDepartment, setCurrentDepartment] = useState({
		index: 0, data: DEPARTMENTS[0]
	});

	const [currentTeachers, setCurrentTeachers] = useState();

	const [currentCourses, setCurrentCourses] = useState();

	const [toggleStatus, setToggleStatus] = useState({
		teachers: false,
		courses: false,		
	})	

	useEffect(() => {
		changeCurrentDepartment(DEPARTMENTS[0], 0);		
	}, []);

	const changeTab = (department, index) => {
		changeCurrentDepartment(department, index);
		setToggleStatus({
			teachers: false,
			courses: false
		})
	}

	const changeCurrentDepartment = (department, index) => {
		setCurrentDepartment({
			index: index,
			data: DEPARTMENTS[index]
		});
		var teachers = [];
		for (var key in TEACHERS){
			if (TEACHERS[key].departments.indexOf(department.department_id) > -1)
				teachers.push(TEACHERS[key]);
		}
		setCurrentTeachers(teachers);		
		var courses = [];
		for (var key in COURSES){
			if (COURSES[key].departments.indexOf(department.department_id) > -1)
				courses.push(COURSES[key]);
		}
		setCurrentCourses(courses);
	}

	const toggleShowData = (type) => {
		setToggleStatus({...toggleStatus, [type]: !toggleStatus[type]});		
	}

	const submitDepartment = () => {
		alert(JSON.stringify(currentDepartment));
	}

	const updateSection = (departmentIndex, sectionIndex, newSection) => {
		var department = departments[departmentIndex];
		department.sections[sectionIndex] = newSection
		var newDepartments = departments;
		newDepartments[departmentIndex] = department;
		changeCurrentDepartment(department, departmentIndex);
		setDepartments(newDepartments);		
	}

	const deleteSection = (departmentIndex, sectionIndex) => {
		var department = departments[departmentIndex];
		department.sections = department.sections.filter((section, index) => index !== sectionIndex);
		var newDepartments = departments;
		newDepartments[departmentIndex] = department;
		changeCurrentDepartment(department, departmentIndex);
		setDepartments(newDepartments);		
	}

	const addSection = (departmentIndex, newSection) => {
		var department = departments[departmentIndex];
		department.sections.push(newSection);
		var newDepartments = departments;
		newDepartments[departmentIndex] = department;
		changeCurrentDepartment(department, departmentIndex);
		setDepartments(newDepartments);
	}
	
	return (
		<>
		<div id='assign-resources-dashboard'>
			<div id='assign-resources-sidebar'>
				<div className='assign-resources-sidebar-header'>Department(s)</div>
				{
					departments.map((department, index) =>
					{
						return(
							<div className={`assign-resources-sidebar-btn ${currentDepartment.data.department_id === department.department_id ? 'assign-resources-sidebar-btn-selected' : ''}`} 
								key={department.department_id} 
								onClick={() => changeTab(department, index)}
							>
								{department.department}
							</div>
						)
					})
				}
			</div>
			<div id='assign-resources-content'>
				<div className='assign-resources-content-header-container'>
					<h1 className='assign-resources-content-header'>{currentDepartment.data.department}</h1>
					{ userPermission.indexOf(currentDepartment.data.department_id) > -1 && 
						<div id='assign-resources-submit-btn-container'>
							<div className='btn green-btn' style={{margin:'0px'}} onClick={ () => submitDepartment() }>Submit</div>
						</div>
					}
				</div>
				<div className='assign-resources-supervisor-confirm-container'>
					<div className='assign-resources-supervisor-confirm-col'>
						<div className='assign-resources-supervisor-confirm-header purple fixed-heading-on-scroll' onClick={() => toggleShowData('teachers')}>
							<div>Teachers</div>
							<FontAwesomeIcon className='assign-resources-supervisor-confirm-header-icon cursor-pointer' icon={toggleStatus.teachers? faAngleDown: faAngleUp} />
						</div>
						{toggleStatus.teachers && 
							<div className='assign-resources-supervisor-confirm-data-container' data-type='teachers'>
								{currentTeachers.length === 0 && <div className='assign-resources-no-data-row'>There are no teachers in this department yet</div>}
								{
									currentTeachers.map((teacher, index) => {										
										return (
											<div className='assign-resources-supervisor-confirm-row' key={index}>
												<div>{teacher.name}, {teacher.first_name} {teacher.departments.length > 1 ? <span className='dual-dept-label'>Dual Depts.</span> : ''}</div>
												<div className='assign-resources-unassigned-department-container'>
													{currentDepartment.data.sections.map((section, s_idx) => {
														if (section.teacher_id === teacher.teacher_id)
															return (
																<CustomSection key={s_idx}
																	teacherId={teacher.teacher_id}
																	courseId={section.course_id}
																	labels={section.labels} 
																	sectionIndex={s_idx}
																	currentDepartment={currentDepartment}
																	updateSection={updateSection}
																	deleteSection={deleteSection}
																	view="teacher"
																/>
															)}
													)}
													<CustomSection
														teacherId={teacher.teacher_id}
														currentDepartment={currentDepartment}
														addSection={addSection}
														new={true}
														view="teacher"
													/>
												</div>
											</div>
										)
									})
								}
							</div>	
						}
					</div>
					<div className='assign-resources-supervisor-confirm-col'>
						<div className='assign-resources-supervisor-confirm-header blue fixed-heading-on-scroll' onClick={() => toggleShowData('courses')}>
							<div>Courses</div>
							<FontAwesomeIcon className='assign-resources-supervisor-confirm-header-icon cursor-pointer' icon={toggleStatus.courses? faAngleDown: faAngleUp}/>
						</div>
						{ toggleStatus.courses && 
							<div className='assign-resources-supervisor-confirm-data-container' data-type='courses'>
								{ currentCourses.length === 0 && <div className='assign-resources-no-data-row'>There are no courses in this department yet</div> }
								{
									currentCourses.map((course, index) => {
										return (
											<div className='assign-resources-supervisor-confirm-row' key={index}>
												<div>{course.name} ({course.course_code})</div>
												<div className='assign-resources-unassigned-department-container'>
													{currentDepartment.data.sections.map((section, s_idx) => {
														if (section.course_id === course.course_id)
															return (
																<CustomSection key={s_idx}
																	teacherId={section.teacher_id}
																	courseId={course.course_id}
																	labels={section.labels} 
																	sectionIndex={s_idx}
																	currentDepartment={currentDepartment}
																	updateSection={updateSection}
																	deleteSection={deleteSection}
																	view="course"
																/>
															)}
													)}
													<CustomSection
														courseId={course.course_id}
														currentDepartment={currentDepartment}
														addSection={addSection}
														new={true}
														view="course"
													/>
												</div>
											</div>
										)
									})
								}
							</div>
						}
					</div>
				</div>					
			</div>
		</div>
		</>
	)
}

function CustomSection(props) {	
	const suggestions = [
		{id : 'bilingual', text: 'bilingual'},
		{id: 'icr', text: 'icr'}
	];

	const KeyCodes = {
	  comma: 188,
	  enter: 13,
	};

	const delimiters = [KeyCodes.comma, KeyCodes.enter];

	const [customStatus, setCustomStatus] = useState(false);

	const [labels, setLabels] = useState(props.labels? props.labels.map(label => {
		return {id: label, text: label}
	}):[]);

	const [teacherId, setTeacherId] = useState(props.teacherId||1);

	const [courseId, setCourseId] = useState(props.courseId||1);

	const deleteSection = () => {
		props.deleteSection(props.currentDepartment.index, props.sectionIndex);
	}

	const switchView = () => {
		setCustomStatus(!customStatus);
	}

	const saveView = () => {
		if (teacherId === 0 || courseId === 0){
			alert('Please select the teacher and course.');
			return
		}
		var section = {
			teacher_id: parseInt(teacherId),
			course_id: parseInt(courseId),
			labels: labels.map(label => label.text)|| []
		}
		if (props.new)
			props.addSection(props.currentDepartment.index, section);
		else
			props.updateSection(props.currentDepartment.index, props.sectionIndex, section);
		setCustomStatus(false);
	}

	const handleDelete = (i) => {
		setLabels(labels.filter((label, index) => index !== i));
	}

	const handleAddition = (label) => {
		labels.push(label);
		setLabels(labels);
	}

	const handleDrag = (label, currPos, newPos) => {
		const newLabels = labels.slice();
		newLabels.splice(currPos, 1);
		newLabels.splice(newPos, 0, label);
		setLabels(newLabels);	
	}

	const handleChange = (event) => {
		const [value] = event.target.value;
		setTeacherId(value);
	}

	const handleChangeCourse = (event) => {
		const [value] = event.target.value;
		setCourseId(value);
	}

	if (props.new)
		return (
			customStatus? 
			<div className='data-section-label'>
				<div className='data-section-info'>
					<div className="data-info-item">
						<span>Course: &nbsp;</span>
						{
							props.view === 'course'?
							<span>{COURSES[courseId].name}</span>
							:
							<select className="select1" onChange={ (event) => handleChangeCourse(event) }>
								{
									Object.keys(COURSES).map((key, index) => {
										var course = COURSES[key];
										return(<option key={index} value={course.course_id}>{course.name}</option>)
									})
								}
							</select>
						}
					</div>
					<div className="data-info-item">
						<span>Teacher: &nbsp;</span>
						{
							props.view === 'course'?
							<>
								<select className="select1" onChange={ (event) => handleChange(event) }>
									{
										Object.keys(TEACHERS).map((key, index) => {
											var teacher = TEACHERS[key];
											return(<option key={index} value={teacher.teacher_id}>{teacher.name}</option>)
										})
									}
								</select>
							</>
							:									
							<span>{TEACHERS[teacherId].name}</span>
						}
					</div>
					<div className="data-info-item">
						<span className="data-info-label">Labels: &nbsp;</span>
						<ReactTags
							tags={labels}
							suggestions={suggestions}
							delimiters={delimiters}
							handleDelete={handleDelete}
							handleAddition={handleAddition}
							handleDrag={handleDrag}
							placeholder="Add Labels"
						/>
					</div>
				</div>
				<div className='data-seciton-tool'>
					<FontAwesomeIcon className='x-remove' icon={faSave} onClick={() => saveView()}/>
					<FontAwesomeIcon className='x-remove' icon={faTimes} onClick={() => switchView()}/>
				</div>
			</div>
			:
			<div className='data-section-label add-new'>
				<div className='data-seciton-tool'>
					<FontAwesomeIcon className='x-remove' icon={faPlus} onClick={() => switchView() }/>
				</div>
			</div>
		)
	else
		return (
			<div className='data-section-label'>
				{ customStatus? 
					<>
						<div className="data-section-info">
							<div className="data-info-item">
								<span>Course: &nbsp;{COURSES[courseId].name}</span>
							</div>
							<div className="data-info-item">
								<span>Teacher: &nbsp;</span>
								<select className="select1" onChange={ (event) => handleChange(event) }>
									{
										Object.keys(TEACHERS).map((key, index) => {
											var teacher = TEACHERS[key];
											if (teacher.teacher_id == teacherId)
												return (<option key={index} value={teacher.teacher_id} selected >{teacher.name}</option>)
											else
												return(<option key={index} value={teacher.teacher_id}>{teacher.name}</option>)
										})
									}
								</select>
							</div>
							<div className="data-info-item">
								<span className="data-info-label">Labels: &nbsp;</span>
								<ReactTags
									tags={labels}
									suggestions={suggestions}
									delimiters={delimiters}
									handleDelete={handleDelete}
									handleAddition={handleAddition}
									handleDrag={handleDrag}
									placeholder="Add Labels"
								/>
							</div>
						</div>
						<div className="data-seciton-tool">
							<FontAwesomeIcon className='x-remove' icon={faSave} onClick={() => saveView()}/>
							<FontAwesomeIcon className='x-remove' icon={faRedo} onClick={() => switchView()}/>
						</div>
					</>
					:
					<>
						<div className="data-section-info view-only">
							<span className="data-section-header">{COURSES[courseId].name} ({TEACHERS[teacherId].name})</span>
							{
								props.labels.map(label => {
									return (
										<span className="data-label-item" key={label}>{label}</span>
									)
								})
							}
						</div>
						<div className="data-seciton-tool">
							<FontAwesomeIcon className='x-remove' icon={faEdit} onClick={() => switchView()}/>
							<FontAwesomeIcon className='x-remove' icon={faTimes} onClick={() => deleteSection()}/>
						</div>
					</>
				}
			</div>
		)
}
