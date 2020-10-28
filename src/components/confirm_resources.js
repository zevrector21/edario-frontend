import React, { useState , useEffect , useRef } from 'react';
import { API } from "aws-amplify";
import Fuse from 'fuse.js';
import swal from '@sweetalert/with-react';

import Modal from '../Modal';

import { JSONexists, getData, getJSONFromStorage, sortObject, isEmpty, getNextAppScreen, useOutsideClick, loadData, convertObjectToArray, deleteData } from '../../js/Helpers';
import { changeDataDepartment } from '../../js/admin/SaveFunctions';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCheck, faEdit, faUserCircle, faCheckCircle, faHourglassHalf, faAngleDown, faAngleUp, faSearch } from '@fortawesome/free-solid-svg-icons';

export default function ConfirmResources({ userRole }) {
	const ref = useRef();
	
	const [dataVersionID, setDataVersionID] = useState(null);
	
	const [unassigned, setUnassigned] = useState({});
	const [departments, setDepartments] = useState({});
	const [currentScreen, setCurrentScreen]= useState({screen_type: null, subscreen: null, data:[]});
	
	const [teachers, setTeachers] = useState({});
	const [courses, setCourses] = useState({});
	const [classrooms, setClassrooms] = useState({});
	
	const [teacherResults, setTeacherResults] = useState([]);
	const [courseResults, setCourseResults] = useState([]);
	const [classroomResults, setClassroomResults] = useState([]);
	
	const [dontShowUnassigned, setDontShowUnassigned] = useState(false);
	const [dontShowDepartments, setDontShowDepartments] = useState(false);
	
	const getUnassignedResourcesData = async (_callback = () => {}) => {
		const apiName = 'edario-v1';
		const url = '/admin/get-unassigned-resources-data';
	    const myInit = { // OPTIONAL
	        response: true,
	        queryStringParameters: {},
	    };
	   
		try {
			const response = await API.get(apiName, url, myInit);
			const data = response.data;
			
			const departments = data.departments;
			const unassigned = data.unassigned;
			
			sessionStorage.setItem('departments', JSON.stringify(departments));
			sessionStorage.setItem('unassigned', JSON.stringify(unassigned));
			
			_callback();
		} catch(e)
		{
			console.log(e.response);
		}
	}
	
	const updateHTML = () => {
		const unassigned = getJSONFromStorage('unassigned', true, 'session');
		const departments = getJSONFromStorage('departments', true, 'session');
		
		const sorted_departments = sortObject(departments, 'department', 'text');
		
		// Filter out deleted unassigned resources
		unassigned['teachers'] = Object.filter(unassigned['teachers'], data => data.is_deleted === false);
		unassigned['courses'] = Object.filter(unassigned['courses'], data => data.is_deleted === false);
		unassigned['classrooms'] = Object.filter(unassigned['classrooms'], data => data.is_deleted === false);
		
		setUnassigned(unassigned);
		setDepartments(sorted_departments);
	}
	
	const changeUnassignedScreen = (subscreen) => {
		// If navigating to new screen, close all current department lists
		if(subscreen !== currentScreen.subscreen) closeAllDepartmentLists();
		
		const unassigned = getJSONFromStorage('unassigned', true, 'session');
		let currentData = unassigned[subscreen];
		let filteredData = Object.filter(currentData, data => data.is_deleted === false); // filter out deleted unassigned resources
		
		if(subscreen === 'teachers')
		{
			filteredData = sortObject(filteredData, 'name', 'text');
		}
		else if(subscreen === 'courses')
		{
			filteredData = sortObject(filteredData, 'name', 'text');
		}
		else if(subscreen === 'classrooms')
		{
			filteredData = sortObject(filteredData, 'classroom_name', 'text');
		}
		
		setCurrentScreen({screen_type: "unassigned", subscreen: subscreen, data:filteredData});
	}
	
	const changeDepartmentScreen = (department_id) => {
		// If navigating to new screen, close all current department lists
		if(department_id !== currentScreen.subscreen) closeAllDepartmentLists();
		
		const departments = getJSONFromStorage('departments', true, 'session');
		const department_info = departments[department_id];
		
		// Filter out delete data, then sort it 
		department_info.teachers = sortObject(Object.filter(department_info.teachers, data => data.is_deleted === false), 'name', 'text');
		department_info.courses = sortObject(Object.filter(department_info.courses, data => data.is_deleted === false), 'name', 'text');
		department_info.classrooms = sortObject(Object.filter(department_info.classrooms, data => data.is_deleted === false), 'classroom_name', 'text');
		
		// If we're on the same department, remember which accordian elements are open
		if(department_id === currentScreen.subscreen) department_info.opened = currentScreen.data.opened;
		
		setCurrentScreen({screen_type: "departments", subscreen: department_id, data:department_info});
	}
	
	const showDepartments = (data_type, data_id) => {
		const screen_type = currentScreen.screen_type;
		const subscreen = currentScreen.subscreen;
		
		const session_data = getJSONFromStorage([`${screen_type}`], true, 'session');
		
		if(screen_type === 'unassigned') session_data[subscreen][data_id]['show_departments'] = true;
		if(screen_type === 'departments') session_data[subscreen][data_type][data_id]['show_departments'] = true;
		
		sessionStorage.setItem([`${screen_type}`], JSON.stringify(session_data));
		
		if(screen_type === 'unassigned') changeUnassignedScreen(subscreen);
		if(screen_type === 'departments') changeDepartmentScreen(subscreen);
		
		updateHTML();
	}
	
	const closeAllDepartmentLists = () => {
		// Close any open department lists
		if(currentScreen.screen_type === 'unassigned')
		{
			const unassigned = getJSONFromStorage('unassigned', true, 'session');
			
			for(var data_id in unassigned[currentScreen.subscreen])
			{
				unassigned[currentScreen.subscreen][data_id]['show_departments'] = false;
			}
			
			sessionStorage.setItem('unassigned', JSON.stringify(unassigned));
		}
	}
	
	const closeDepartmentList = (data_id, data_type = null) => {
		const screen_type = currentScreen.screen_type;
		const subscreen = currentScreen.subscreen;
		
		const session_data = getJSONFromStorage([`${screen_type}`], true, 'session');
		
		if(screen_type === 'unassigned') session_data[subscreen][data_id]['show_departments'] = false;
		if(screen_type === 'departments') session_data[subscreen][data_type][data_id]['show_departments'] = false;
		
		sessionStorage.setItem([`${screen_type}`], JSON.stringify(session_data));
		
		if(screen_type === 'unassigned') changeUnassignedScreen(subscreen);
		if(screen_type === 'departments') changeDepartmentScreen(subscreen);
		
		updateHTML();
	}
	
	useOutsideClick(ref, () => {
		if(currentScreen.screen_type === 'unassigned')
		{
			const data_id = ref.current.closest('.assign-resources-unassigned-row').getAttribute('data-id');
			closeDepartmentList(data_id);
		}
		else if(currentScreen.screen_type === 'departments')
		{
			const data_id = ref.current.closest('.assign-supervisor-options-container').getAttribute('data-id');
			const data_type = ref.current.closest('.assign-resources-supervisor-confirm-data-container').getAttribute('data-type');
			closeDepartmentList(data_id, data_type);
		}
	});
	
	const removeUnassignedData = async (data_id) => {
		let remove_unassigned_data_bool = true;
		const subscreen = currentScreen.subscreen;
		const data_version_id = getJSONFromStorage('currentDataVersionID', false);
		
		const data = {data_version_id:data_version_id, data_type: subscreen, data_id:data_id};
		
		closeDepartmentList(data_id);
		
		if(!dontShowUnassigned)
		{
			let data_name;
			
			if(subscreen === 'teachers')
			{
				const data_details = teachers[data_id];
				const teacher_first_name = data_details.first_name;
				const teacher_last_name = data_details.name;
				
				data_name = `${teacher_first_name} ${teacher_last_name}`;
			}
			else if(subscreen === 'courses')
			{
				const data_details = courses[data_id];
				const course_name = data_details.name;
				const course_code = data_details.course_code;
				
				data_name = `${course_name} (${course_code})`;
			}
			else if(subscreen === 'classrooms')
			{
				const data_details = classrooms[data_id];
				
				data_name = data_details['classroom_name'];
			}
			
			const options =  {
				title: "Are you sure?",
				text: `Do you really want to delete ${data_name}? This data will no longer be available to be assigned to any department.`,
				icon: "warning",
				dangerMode: true,
				buttons: {
					cancel: {
						text: "Cancel",
						value: false,
						visible: true,
						className: 'gray-btn'
					},
					confirm: {
						text: "Yes",
						value: true,
						visible: true,
						className: 'red-btn'
					},
				},
				content: (
					<div className='sweet-alert-dont-show-message'>
						<label className="checkmark_container">Please don&rsquo;t show me this message again
							<input type="checkbox" />
							<span className="checkmark" onClick={toggleDontShow}></span>
						</label>
					</div>
				)
			}
		
			remove_unassigned_data_bool = await swal(options);
		}
		
		if(remove_unassigned_data_bool) deleteData(data);
	}
	
	const toggleShowData = (type) => {
		currentScreen.data.opened[type] = !currentScreen.data.opened[type];
		
		setCurrentScreen({...currentScreen});
	}
	
	const toggleAddNewData = (data_type) => {
		const departments = getJSONFromStorage('departments', true, 'session');
		const department_id = currentScreen.subscreen;
		
		departments[department_id]['add_new_opened'][data_type] = !departments[department_id]['add_new_opened'][data_type];
		
		sessionStorage.setItem('departments', JSON.stringify(departments));
		
		setTeacherResults([]);
		setCourseResults([]);
		setClassroomResults([]);
		
		changeDepartmentScreen(department_id);
		updateHTML();
	}
	
	const fuzzySearch = (e, dataType) => {
		const search_value = e.target.value;
		
		if(dataType === 'teachers')
		{
			const teacherArray = convertObjectToArray(teachers);
			
			const fuse = new Fuse(teacherArray, {
				keys: ['name', 'first_name'],
				threshold: .6
			})
			
			const results = fuse.search(search_value);
			const teacher_results = results.map(result => result.item);
			
			setTeacherResults(teacher_results);
		}
		else if(dataType === 'courses')
		{
			const courseArray = convertObjectToArray(courses);
			
			const fuse = new Fuse(courseArray, {
				keys: ['name', 'course_code'],
				threshold: .6
			})
			
			const results = fuse.search(search_value);
			const course_results = results.map(result => result.item);
			
			setCourseResults(course_results);
		}
		else if(dataType === 'classrooms')
		{
			const classroomArray = convertObjectToArray(classrooms);
			
			const fuse = new Fuse(classroomArray, {
				keys: ['classroom_name'],
				threshold: .6
			})
			
			const results = fuse.search(search_value);
			const classroom_results = results.map(result => result.item);
			
			setClassroomResults(classroom_results);
		}
	}
	
	const toggleDontShow = () => {
		if(currentScreen.screen_type === 'unassigned') setDontShowUnassigned(!dontShowUnassigned);
		if(currentScreen.screen_type === 'departments') setDontShowDepartments(!dontShowDepartments);
	}
	
	const changeDepartmentResource = async (changeType, dataType, data_id, old_department_id, new_department_id) => {
		if(old_department_id === new_department_id) return;
		
		let change_data_department_bool = true;
		const data_version_id = getJSONFromStorage('currentDataVersionID', false);
		const data = {change_type:changeType, data_type:dataType, data_version_id:data_version_id, data_id:data_id, old_department_id:old_department_id, new_department_id:new_department_id};
		
		closeDepartmentList(data_id, dataType);
		
		// If removing data from department, show modal to warn them first
		if(changeType !== 'add' && !dontShowDepartments)
		{
			let data_name;
			const departments = getJSONFromStorage('departments', true, 'session');
			
			if(dataType === 'teachers')
			{
				const data_details = teachers[data_id];
				const teacher_first_name = data_details.first_name;
				const teacher_last_name = data_details.name;
				
				data_name = `${teacher_first_name} ${teacher_last_name}`;
			}
			else if(dataType === 'courses')
			{
				const data_details = courses[data_id];
				const course_name = data_details.name;
				const course_code = data_details.course_code;
				
				data_name = `${course_name} (${course_code})`;
			}
			else if(dataType === 'classrooms')
			{
				const data_details = classrooms[data_id];
				
				data_name = data_details['classroom_name'];
			}
			
			const department = (changeType === 'remove') ? departments[old_department_id]['department'] : departments[new_department_id]['department'];
			const modal_text = (changeType === 'remove') ? `Do you really want to remove ${data_name} from the ${department} department?` : `Do you really want to send ${data_name} to the ${department} department?`
			
			const options =  {
				title: "Are you sure?",
				text: modal_text,
				icon: "warning",
				dangerMode: true,
				buttons: {
					cancel: {
						text: "Cancel",
						value: false,
						visible: true,
						className: 'gray-btn'
					},
					confirm: {
						text: "Yes",
						value: true,
						visible: true,
						className: 'red-btn'
					},
				},
				content: (
					<div className='sweet-alert-dont-show-message'>
						<label className="checkmark_container">Please don&rsquo;t show me this message again
							<input type="checkbox" />
							<span className="checkmark" onClick={toggleDontShow}></span>
						</label>
					</div>
				)
			}
		
			change_data_department_bool = await swal(options);
		}
		
		if(change_data_department_bool) changeDataDepartment(data).then(() => {
			getUnassignedResourcesData(() => {
				if(currentScreen.screen_type === 'unassigned') changeUnassignedScreen(currentScreen.subscreen);
				if(currentScreen.screen_type === 'departments') changeDepartmentScreen(currentScreen.subscreen);
				
				updateHTML();
			});
		});
		
		
	}
	
	useEffect(() => {
		loadData('teachers', dataVersionID).then(teachers => {
			setTeachers(teachers);
		});
		
		loadData('courses', dataVersionID).then(courses => {
			setCourses(courses);
		});
		
		loadData('classrooms', dataVersionID).then(classrooms => {
			setClassrooms(classrooms);
		});
	}, [dataVersionID]);
	
	useEffect(() => {
		getUnassignedResourcesData(() => {
			changeUnassignedScreen('teachers');
			updateHTML();
		});
		
		if(JSONexists('currentDataVersionID'))
		{
			const data_version_id = getJSONFromStorage('currentDataVersionID', false);
			setDataVersionID(data_version_id);
		}
		else
		{
			const get_schedule_info = getData('scheduleInfo', '/get-schedule-info', {}, false).then(schedule_info_data => {
				const data_version_id = schedule_info_data.current_data_version_id;
				
				localStorage.setItem('currentDataVersionID', data_version_id);
				
				setDataVersionID(data_version_id);
			});
		}
	}, []);
	
	//console.log(currentScreen);
	
	return (
		<>
		<div id='assign-resources-dashboard'>
			<div id='assign-resources-sidebar'>
				{userRole === 'admin' &&
					<>
					<div className='assign-resources-sidebar-header'>Unassigned Resources</div>
					<div className={`assign-resources-sidebar-btn ${currentScreen.subscreen === 'teachers' ? 'assign-resources-sidebar-btn-selected' : ''}`} onClick={() => changeUnassignedScreen('teachers')}>Teachers <span className='unassigned-resource-counter'>{('teachers' in unassigned) ? Object.keys(unassigned.teachers).length : 0}</span></div>
					<div className={`assign-resources-sidebar-btn ${currentScreen.subscreen === 'courses' ? 'assign-resources-sidebar-btn-selected' : ''}`} onClick={() => changeUnassignedScreen('courses')}>Courses <span className='unassigned-resource-counter'>{('courses' in unassigned) ? Object.keys(unassigned.courses).length : 0}</span></div>
					<div className={`assign-resources-sidebar-btn ${currentScreen.subscreen === 'classrooms' ? 'assign-resources-sidebar-btn-selected' : ''}`} onClick={() => changeUnassignedScreen('classrooms')}>Classrooms <span className='unassigned-resource-counter'>{('classrooms' in unassigned) ? Object.keys(unassigned.classrooms).length : 0}</span></div>
					<div className='assign-resources-sidebar-separator'></div>
					</>
				}
				<div className='assign-resources-sidebar-header'>Department(s)</div>
				{Object.keys(departments).map(index => {
						const department_info = departments[index];
						const department_id = department_info.department_id;
						const department = department_info.department;
						const current_user_is_supervisor = department_info.current_user_is_supervisor;
						
						if(userRole === 'admin' || current_user_is_supervisor)
						{
							return (
								<div className={`assign-resources-sidebar-btn ${currentScreen.subscreen === department_id ? 'assign-resources-sidebar-btn-selected' : ''}`} key={index} onClick={() => changeDepartmentScreen(department_id)}>{department}</div>
							)
						}
					})
				}
			</div>
			<div id='assign-resources-content'>
				{currentScreen.screen_type === "unassigned" &&
					<>
					<h1 className='assign-resources-content-header'>Unassigned <span className='capitalize'>{currentScreen.subscreen}</span></h1>
					<p>These are the {currentScreen.subscreen} that are not assigned to a department. You can either assign them to a department now, leave them as unassigned, or delete them! <span className='red-text'>Any unassigned resource will become your responsibility to manage during the scheduling process</span>.</p>
					{(currentScreen.data.length === 0) &&
						<div className='assign-resources-screen-message'>
							<FontAwesomeIcon className='green-text' style={{fontSize:'60px'}} icon={faCheckCircle}/>
							<h1>All Done</h1>
							<div>All {currentScreen.subscreen} are assigned to a department</div>
						</div>
					}
					{(currentScreen.data.length !== 0) &&
						<div id='assign-resources-unassigned-content'>
							<div className='assign-resources-unassigned-header fixed-heading-on-scroll'>
								<div className='assign-resources-unassigned-header-name'><span className='capitalize'>{currentScreen.subscreen}</span></div>
								<div className='assign-resources-unassigned-header-department'>Department</div>
								<div className='assign-resources-unassigned-header-filler'></div>
							</div>
						{currentScreen.data.map((current_data, i) => {
							if(currentScreen.subscreen === 'teachers')
							{
								return (
									<div className='assign-resources-unassigned-row' data-id={current_data.teacher_id} key={i}>
										<div>{current_data.name}, {current_data.first_name}</div>
										<div className='assign-resources-unassigned-department-container'>
											{current_data.department_id !== 0 &&
												<div className='assign-resources-unassigned-department'>{current_data.department}</div>
											}
											<span className='assign-resources-unassigned-choose-department blue-link small-text'>
												<span className='click-restricted' onClick={() => showDepartments(currentScreen.subscreen, current_data.teacher_id)}>{current_data.department_id === 0 ? 'Choose Department' : 'Change'}</span>
												<div className='assign-supervisor-options-container'>
													{current_data.show_departments &&
														<div className='data-options-container' ref={ref}>
															<div className='data-options-option' style={{borderBottom:'1px solid #efefef'}} onClick={() => closeDepartmentList(current_data.teacher_id)}>No Department</div>
															{Object.keys(departments).map(index => {
																const department_info = departments[index];
																const department = department_info.department;
																
																return (
																	<div className='data-options-option' key={index} onClick={() => changeDepartmentResource('add', 'teachers', current_data.teacher_id, null, department_info.department_id)}>{department}</div>
																)	
															})}
														</div>
													}
												</div>
											</span>
										</div>
										<FontAwesomeIcon className='x-remove' icon={faTimes} onClick={() => removeUnassignedData(current_data.teacher_id)}/>
									</div>
								)
							}
							else if(currentScreen.subscreen === 'courses')
							{
								return (
									<div className='assign-resources-unassigned-row' data-id={current_data.course_id} key={i}>
										<div>{current_data.name} ({current_data.course_code})</div>
										<div className='assign-resources-unassigned-department-container'>
											{current_data.department_id !== 0 &&
												<div className='assign-resources-unassigned-department'>{current_data.department}</div>
											}
											<span className='assign-resources-unassigned-choose-department blue-link small-text'>
												<span className='click-restricted' onClick={() => showDepartments(currentScreen.subscreen, current_data.course_id)}>{current_data.department_id === 0 ? 'Choose Department' : 'Change'}</span>
												<div className='assign-supervisor-options-container'>
													{current_data.show_departments &&
														<div className='data-options-container' ref={ref}>
															<div className='data-options-option' style={{borderBottom:'1px solid #efefef'}} onClick={() => closeDepartmentList(current_data.course_id)}>No Department</div>
															{Object.keys(departments).map(index => {
																const department_info = departments[index];
																const department = department_info.department;
																
																return (
																	<div className='data-options-option' key={index} onClick={() => changeDepartmentResource('add', 'courses', current_data.course_id, null, department_info.department_id)}>{department}</div>
																)	
															})}
														</div>
													}
												</div>
											</span>
										</div>
										<FontAwesomeIcon className='x-remove' icon={faTimes} onClick={() => removeUnassignedData(current_data.course_id)}/>
									</div>
								)
							}
							else if(currentScreen.subscreen === 'classrooms')
							{
								return (
									<div className='assign-resources-unassigned-row' data-id={current_data.classroom_id} key={i}>
										<div>{current_data.classroom_name}</div>
										<div className='assign-resources-unassigned-department-container'>
											{current_data.department_id !== 0 &&
												<div className='assign-resources-unassigned-department'>{current_data.department}</div>
											}
											<span className='assign-resources-unassigned-choose-department blue-link small-text'>
												<span className='click-restricted' onClick={() => showDepartments(currentScreen.subscreen, current_data.classroom_id)}>{current_data.department_id === 0 ? 'Choose Department' : 'Change'}</span>
												<div className='assign-supervisor-options-container'>
													{current_data.show_departments &&
														<div className='data-options-container' ref={ref}>
															<div className='data-options-option' style={{borderBottom:'1px solid #efefef'}} onClick={() => closeDepartmentList(current_data.classroom_id)}>No Department</div>
															{Object.keys(departments).map(index => {
																const department_info = departments[index];
																const department = department_info.department;
																
																return (
																	<div className='data-options-option' key={index} onClick={() => changeDepartmentResource('add', 'classrooms', current_data.classroom_id, null, department_info.department_id)}>{department}</div>
																)	
															})}
														</div>
													}
												</div>
											</span>
										</div>
										<FontAwesomeIcon className='x-remove' icon={faTimes} onClick={() => removeUnassignedData(current_data.classroom_id)}/>
									</div>
								)
							}
						})}
						</div>
					}
					</>
				}
				{currentScreen.screen_type === "departments" &&
					<>
					<div className='assign-resources-content-header-container'>
						<h1 className='assign-resources-content-header'>{currentScreen.data.department}</h1>
						<div id='assign-resources-submit-btn-container'>
							<div className='btn green-btn' style={{margin:'0px'}}>Submit</div>
						</div>
						<div id='assign-resources-supervisor-container'>
						{Object.keys(currentScreen.data.supervisors).map(index => {
							const supervisor = currentScreen.data.supervisors[index];
							
							return (
								<div className='assign-resources-supervisor-inner-container' key={index}>
									{supervisor.img_url !== null &&
										<img className='assign-resources-supervisor-img' src={require(`../../images/users/${supervisor.img_url}`)} alt='user' />
									}
									{supervisor.img_url === null &&
										<FontAwesomeIcon className='assign-supervisor-user-icon' icon={faUserCircle}/>
									}
									<div className='assign-resources-department-supervisor'>{supervisor.last_name}, {supervisor.first_name}</div>
								</div>
							)
						})}
							<div className='clear'></div>
						</div>
					</div>
					{(!currentScreen.data.department_submitted && !currentScreen.data.current_user_is_supervisor) &&
						<div className='assign-resources-screen-message'>
							<FontAwesomeIcon className='turquoise-text' style={{fontSize:'60px'}} icon={faHourglassHalf}/>
							<h1>Pending...</h1>
							<div>Waiting on confirmation from department supervisor</div>	
						</div>
					}
					{(!currentScreen.data.department_submitted || (userRole === 'admin' && currentScreen.data.department_submitted && !currentScreen.data.confirmed)) &&
						<>
						<div className='assign-resources-supervisor-confirm-container'>
							<div className='assign-resources-supervisor-confirm-col'>
								<div className='assign-resources-supervisor-confirm-header purple fixed-heading-on-scroll'>
									<div>Teachers</div>
									{currentScreen.data.opened.teachers &&
										<FontAwesomeIcon className='assign-resources-supervisor-confirm-header-icon cursor-pointer' icon={faAngleDown} onClick={() => toggleShowData('teachers')}/>
									}
									{!currentScreen.data.opened.teachers &&
										<FontAwesomeIcon className='assign-resources-supervisor-confirm-header-icon cursor-pointer' icon={faAngleUp} onClick={() => toggleShowData('teachers')}/>
									}
								</div>
								{currentScreen.data.opened.teachers &&
									<div className='assign-resources-supervisor-confirm-data-container' data-type='teachers'>
										{(currentScreen.data.teachers.length === 0) &&
											<div className='assign-resources-no-data-row'>There are no teachers in this department yet</div>
										}
										{currentScreen.data.teachers.map((teacher, i) => {
											return (
												<div className='assign-resources-supervisor-confirm-row' key={i}>
													<div>{teacher.name}, {teacher.first_name} {teachers[teacher.teacher_id]['departments'].length > 1 ? <span className='dual-dept-label'>Dual Depts.</span> : ''}</div>
													<div className='assign-resources-unassigned-department-container'>
														<div className='assign-resources-unassigned-department'>{currentScreen.data.department}</div>
														<span className='assign-resources-unassigned-choose-department blue-link small-text'>
															<span className='click-restricted' onClick={() => showDepartments('teachers', teacher.teacher_id)}>Change</span>
															<div className='assign-supervisor-options-container' data-id={teacher.teacher_id}>
																{teacher.show_departments &&
																	<div className='data-options-container' ref={ref}>
																		<div className='data-options-option' style={{borderBottom:'1px solid #efefef'}} onClick={() => changeDepartmentResource('remove', 'teachers', teacher.teacher_id, currentScreen.data.department_id, null)}>No Department</div>
																		{Object.keys(departments).map(index => {
																			const department_info = departments[index];
																			const department = department_info.department;
																			
																			return (
																				<div className={`data-options-option ${department_info.department_id === currentScreen.data.department_id ? 'data-option-selected' : ''}`} key={index} onClick={() => changeDepartmentResource('change', 'teachers', teacher.teacher_id, currentScreen.data.department_id, department_info.department_id)}>{department}</div>
																			)	
																		})}
																	</div>
																}
															</div>
														</span>
													</div>
													<FontAwesomeIcon className='x-remove' icon={faTimes} onClick={() => changeDepartmentResource('remove', 'teachers', teacher.teacher_id, currentScreen.data.department_id, null)}/>
												</div>
											)
										})}
										<div className='blue-link assign-resources-supervisor-confirm-add-new' onClick={() => toggleAddNewData('teachers')}>Add New Teacher</div>
										{currentScreen.data.add_new_opened['teachers'] &&
											<div className='assign-resources-add-row-container'>
												<div className='assign-resources-search-container'>
													<div className='assign-resources-adding-input-container'>
														<input className='assign-resources-adding-input' onChange={(e) => fuzzySearch(e, 'teachers')} placeholder='Search for teacher'/>
														<FontAwesomeIcon className='assign-resources-adding-input-icon' icon={faSearch}/>
													</div>
													<FontAwesomeIcon className='x-cancel assign-resources-cancel-new-btn' icon={faTimes} onClick={() => toggleAddNewData('teachers')}/>
												</div>
												{teacherResults.length !== 0 &&
													<div className='assign-resources-search-results'>
														<div className='assign-resources-did-you-mean'>Did you mean:</div>
														{teacherResults.map((teacher, i) => {
															return (
																<div className='assign-resources-search-result' key={i}>
																	<div>{teacher.name}, {teacher.first_name}</div>
																	<div>
																		<div className='assign-resources-add-btn' onClick={() => changeDepartmentResource('add', 'teachers', teacher.teacher_id, null, currentScreen.data.department_id)}>Add</div>
																	</div>
																</div>
															)
														})}
													</div>
												}
											</div>
										}
									</div>
								}
							</div>
							<div className='assign-resources-supervisor-confirm-col'>
								<div className='assign-resources-supervisor-confirm-header blue fixed-heading-on-scroll'>
									<div>Courses</div>
									{currentScreen.data.opened.courses &&
										<FontAwesomeIcon className='assign-resources-supervisor-confirm-header-icon cursor-pointer' icon={faAngleDown} onClick={() => toggleShowData('courses')}/>
									}
									{!currentScreen.data.opened.courses &&
										<FontAwesomeIcon className='assign-resources-supervisor-confirm-header-icon cursor-pointer' icon={faAngleUp} onClick={() => toggleShowData('courses')}/>
									}
								</div>
								{currentScreen.data.opened.courses &&
									<div className='assign-resources-supervisor-confirm-data-container' data-type='courses'>
										{(currentScreen.data.courses.length === 0) &&
											<div className='assign-resources-no-data-row'>There are no courses in this department yet</div>
										}
										{currentScreen.data.courses.map((course, i) => {
											return (
												<div className='assign-resources-supervisor-confirm-row' key={i}>
													<div>{course.name} ({course.course_code})</div>
													<div className='assign-resources-unassigned-department-container'>
														<div className='assign-resources-unassigned-department'>{currentScreen.data.department}</div>
														<span className='assign-resources-unassigned-choose-department blue-link small-text'>
															<span className='click-restricted' onClick={() => showDepartments('courses', course.course_id)}>Change</span>
															<div className='assign-supervisor-options-container' data-id={course.course_id}>
																{course.show_departments &&
																	<div className='data-options-container' ref={ref}>
																		<div className='data-options-option' style={{borderBottom:'1px solid #efefef'}} onClick={() => changeDepartmentResource('remove', 'courses', course.course_id, currentScreen.data.department_id, null)}>No Department</div>
																		{Object.keys(departments).map(index => {
																			const department_info = departments[index];
																			const department = department_info.department;
																			
																			return (
																				<div className={`data-options-option ${department_info.department_id === currentScreen.data.department_id ? 'data-option-selected' : ''}`} key={index} onClick={() => changeDepartmentResource('change', 'courses', course.course_id, currentScreen.data.department_id, department_info.department_id)}>{department}</div>
																			)	
																		})}
																	</div>
																}
															</div>
														</span>
													</div>
													<FontAwesomeIcon className='x-remove' icon={faTimes} onClick={() => changeDepartmentResource('remove', 'courses', course.course_id, currentScreen.data.department_id, null)}/>
												</div>
											)
										})}
										<div className='blue-link assign-resources-supervisor-confirm-add-new' onClick={() => toggleAddNewData('courses')}>Add New Course</div>
										{currentScreen.data.add_new_opened['courses'] &&
											<div className='assign-resources-add-row-container'>
												<div className='assign-resources-search-container'>
													<div className='assign-resources-adding-input-container'>
														<input className='assign-resources-adding-input' onChange={(e) => fuzzySearch(e, 'courses')} placeholder='Search for course'/>
														<FontAwesomeIcon className='assign-resources-adding-input-icon' icon={faSearch}/>
													</div>
													<FontAwesomeIcon className='x-cancel assign-resources-cancel-new-btn' icon={faTimes} onClick={() => toggleAddNewData('courses')}/>
												</div>
												{courseResults.length !== 0 &&
													<div className='assign-resources-search-results'>
														<div className='assign-resources-did-you-mean'>Did you mean:</div>
														{courseResults.map((course, i) => {
															return (
																<div className='assign-resources-search-result' key={i}>
																	<div>{course.name} ({course.course_code})</div>
																	<div>
																		<div className='assign-resources-add-btn' onClick={() => changeDepartmentResource('add', 'courses', course.course_id, null, currentScreen.data.department_id)}>Add</div>
																	</div>
																</div>
															)
														})}
													</div>
												}
											</div>
										}
									</div>									
								}
							</div>
							<div className='assign-resources-supervisor-confirm-col'>
								<div className='assign-resources-supervisor-confirm-header orange fixed-heading-on-scroll'>
									<div>Classrooms</div>
									{currentScreen.data.opened.classrooms &&
										<FontAwesomeIcon className='assign-resources-supervisor-confirm-header-icon cursor-pointer' icon={faAngleDown} onClick={() => toggleShowData('classrooms')}/>
									}
									{!currentScreen.data.opened.classrooms &&
										<FontAwesomeIcon className='assign-resources-supervisor-confirm-header-icon cursor-pointer' icon={faAngleUp} onClick={() => toggleShowData('classrooms')}/>
									}
								</div>
								{currentScreen.data.opened.classrooms &&
									<div className='assign-resources-supervisor-confirm-data-container' data-type='classrooms'>
									{(currentScreen.data.classrooms.length === 0) &&
										<div className='assign-resources-no-data-row'>There are no classrooms in this department yet</div>
									}
									{currentScreen.data.classrooms.map((classroom, i) => {
										return (
											<div className='assign-resources-supervisor-confirm-row' key={i}>
												<div>{classroom.classroom_name}</div>
												<div className='assign-resources-unassigned-department-container'>
													<div className='assign-resources-unassigned-department'>{currentScreen.data.department}</div>
													<span className='assign-resources-unassigned-choose-department blue-link small-text'>
														<span className='click-restricted' onClick={() => showDepartments('classrooms', classroom.classroom_id)}>Change</span>
														<div className='assign-supervisor-options-container' data-id={classroom.classroom_id}>
															{classroom.show_departments &&
																<div className='data-options-container' ref={ref}>
																	<div className='data-options-option' style={{borderBottom:'1px solid #efefef'}} onClick={() => changeDepartmentResource('remove', 'classrooms', classroom.classroom_id, currentScreen.data.department_id, null)}>No Department</div>
																	{Object.keys(departments).map(index => {
																		const department_info = departments[index];
																		const department = department_info.department;
																		
																		return (
																			<div className={`data-options-option ${department_info.department_id === currentScreen.data.department_id ? 'data-option-selected' : ''}`} key={index} onClick={() => changeDepartmentResource('change', 'classrooms', classroom.classroom_id, currentScreen.data.department_id, department_info.department_id)}>{department}</div>
																		)	
																	})}
																</div>
															}
														</div>
													</span>
												</div>
												<FontAwesomeIcon className='x-remove' icon={faTimes} onClick={() => changeDepartmentResource('remove', 'classrooms', classroom.classroom_id, currentScreen.data.department_id, null)}/>
											</div>
										)
									})}
									<div className='blue-link assign-resources-supervisor-confirm-add-new' onClick={() => toggleAddNewData('classrooms')}>Add New Classroom</div>
									{currentScreen.data.add_new_opened['classrooms'] &&
										<div className='assign-resources-add-row-container'>
											<div className='assign-resources-search-container'>
												<div className='assign-resources-adding-input-container'>
													<input className='assign-resources-adding-input' onChange={(e) => fuzzySearch(e, 'classrooms')} placeholder='Search for classroom'/>
													<FontAwesomeIcon className='assign-resources-adding-input-icon' icon={faSearch}/>
												</div>
												<FontAwesomeIcon className='x-cancel assign-resources-cancel-new-btn' icon={faTimes} onClick={() => toggleAddNewData('classrooms')}/>
											</div>
											{classroomResults.length !== 0 &&
												<div className='assign-resources-search-results'>
													<div className='assign-resources-did-you-mean'>Did you mean:</div>
													{classroomResults.map((classroom, i) => {
														return (
															<div className='assign-resources-search-result' key={i}>
																<div>{classroom.classroom_name}</div>
																<div>
																	<div className='assign-resources-add-btn' onClick={() => changeDepartmentResource('add', 'classrooms', classroom.classroom_id, null, currentScreen.data.department_id)}>Add</div>
																</div>
															</div>
														)
													})}
												</div>
											}
										</div>
									}
									</div>
								}
							</div>
						</div>
						</>
					}
					{(currentScreen.data.department_submitted && !currentScreen.data.confirmed) &&
						<div className='assign-resources-screen-message'>
							<FontAwesomeIcon className='turquoise-text' style={{fontSize:'60px'}} icon={faHourglassHalf}/>
							<h1>Pending...</h1>
							<div>Waiting on confirmation from director</div>	
						</div>
					}
					{(currentScreen.data.confirmed) &&
						<div className='assign-resources-screen-message'>
							<FontAwesomeIcon className='green-text' style={{fontSize:'60px'}} icon={faCheckCircle}/>
							<h1>All Done</h1>
							<div>Department resources have been reviewed and confirmed!</div>
						</div>
					}
					</>
				}
			</div>
		</div>
		</>
	)
}