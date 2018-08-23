let store = [],
    $tab = $('.tab'),
    tabType = 'all',
    $tasks = $('#tasks .col'),
    $addBtn = $('.add'),
    $cancelBtn = $('.cancel'),
    $addTask = $('#addTask'),
    $name = $addTask.find(':text'),
    $deadline = $addTask.find('.datepicker').eq(0),
    $comment = $addTask.find('textarea'),
    render = function(tasks){
        let html = tasks.reduce(function(accumulator, task){
            accumulator += taskHtml(task);
            return accumulator;
        }, '')
        $tasks.empty().append(html);
        $( ".datepicker" ).datepicker();

        console.log('render')
    },
    emptyInput = function(){
        $name.val('');
        $deadline.val('');
        $comment.val('');
    },
    taskHtml = function(task){
        let {name, status, ontop, deadline, comment, id} = task,
            html = `<div data-id="${id}" class="row no-gutters task ${ontop ? 'ontop' : ''} ${status === 'complete' ? status : ''}">
                <div class="col">
                    <div class="row justify-content-between no-gutters">
                        <div class="col-sm-1 center">
                            <input type="checkbox" name="" id="" class=" form-control" ${status === 'complete' ? 'checked' : ''}>
                        </div>
                        <div class="col-sm-9 taskname">
                            ${name}
                        </div>
                        <div class="col-sm-1 center">
                            <i class="fas fa-star ${ontop ? 'ontop' : ''}"></i>
                        </div>
                        <div class="col-sm-1 center">
                            <i class="fas fa-pen"></i>
                        </div>
                    </div>
                    <div class="row justify-content-start">
                        <div class="col-sm-1">
                        </div>
                        <div class="col col-sm-auto">
                            <i class="far fa-calendar-alt"></i>
                            ${deadline}
                        </div>
                        <div class="col col-sm-auto pop-btn" >
                            <div class="popover hide">${comment}</div>
                            <i class="far fa-comment-dots"></i>
                        </div>
                    </div>
                </div>
                <div class="col hide">
                        <div class="row justify-content-between task-name">
                            <div class="col">
                                <i class="fas fa-pen"></i>
                                <input type="text" placeholder="做些什麼..." class="form-control" value="${name}">
                            </div>
                        </div>
                        <div class="row task-detail" style="display: block">
                            <div class="col">
                                <div class="row title">
                                    <div class="col">
                                        <i class="far fa-calendar-alt"></i>
                                        到期日
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-sm-3">
                                        <input type="text" class="form-control datepicker" value="${deadline}">
                                    </div>
                                </div>
                                <div class="row title">
                                    <div class="col">
                                        <i class="fas fa-comment-dots"></i>
                                        備註
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col">
                                        <textarea class="form-control" name="" id="" cols="30" rows="3" style="resize: none" value="${comment}">${comment}</textarea>
                                    </div>
                                </div>
                                <div class="row btns">
                                    <button class="btn col-sm-6 center cancel">
                                        <i class="fas fa-times"></i>取消</button>
                                    <button class="btn col-sm-6 center add">
                                        <i class="fas fa-plus"></i>確定</button>
                                </div>
                            </div>
                        </div>
                    </div>
            </div>`
        return html
    },
    filterStore = function(type){
        return store.filter((task) => task.status === type);
    },
    getTaskData = function(el){
        let name = $name.val();
            deadline = $deadline.val();
            comment = $comment.val();
        
        return new Task(name, deadline, comment);
    },
    validate = function(task){
        return task.name === '';
    },
    getId = (function(){
        let id = -1;
        return function(){
            return ++id
        };
    })();
class Task{
    constructor(name, deadline, comment){
        
        this.id = getId();
        this.name = name;
        this.deadline = deadline;
        this.comment = comment;
        this.status = 'progress';
        this.ontop = false;
        console.log(this.id)
    }
    moveTop(){
        this.ontop = true;
    }
    complete(){
        this.status = 'complete';
    }
    undo(){
        this.status = 'progress';
    }
}
// init datepicker
$( ".datepicker.start" ).datepicker({minDate: 0}).val($.datepicker.formatDate('yy/mm/dd', new Date));
// 換頁
$tab.on('click', function(){
    let isFocus = $(this).hasClass('focus'),
        type = $(this).data('type');
    if (!isFocus) {
        let tasks = type === 'all' ? store : filterStore(type);
        tabType = type;

        $(this).addClass('focus').siblings().removeClass('focus');
        render(tasks);
    }
})
// 新增任務
$addBtn.on('click', function(){
    let task = getTaskData();
    if(validate(task)) return alert('請填任務名稱');
    store.push(task);
    render(store);

    emptyInput();
    $(this).closest('.task-detail').slideUp();
})
// 完成任務
$tasks.on('click', ':checkbox', function(){
    let $task = $(this).closest('.task'),
        index = +$task.data('id'),
        isCheck = $(this).prop('checked'),
        tasks;
    if(isCheck) store[index].complete();
    else store[index].undo();

    tasks = tabType !== 'all' ? filterStore(tabType) : store;
    render(tasks);
})
// 新增任務時展開
$('.task-name input').on('focus', function(){
    $('.task-detail').slideDown();
})
// 取消新增任務
$cancelBtn.on('click', function(){
    $(this).closest('.task-detail').slideUp();
})
// 標註重點任務
$tasks.on('click', '.fa-star', function(e){
    console.log(e,e.target,e.currentTarget)
    let $task = $(this).closest('.task'),
        isOntop = $task.hasClass('ontop'),
        id = +$task.data('id'),
        tasks;

    for(let task of store){
        if(task.id !== id) continue;
        task.ontop = !isOntop;
    }
    tasks = tabType === 'all' ? store : filterStore(tabType);
    render(tasks);
})
// 編輯任務
$tasks.on('click', '.fa-pen', function(e){
    let $task = $(this).closest('.task'),
        originalTask = $task.find('>.col:first'),
        taskDetail = $task.find('>.col:nth-child(2)');
    console.log(originalTask, taskDetail)
    originalTask.toggleClass('hide')
    taskDetail.toggleClass('hide')
})
// 確定編輯
$tasks.on('click', '.add', function(e){
    let $task = $(this).closest('.task'),
        id = +$task.data('id'),
        name = $task.find('.task-name input').val(),
        deadline = $task.find('.task-detail input').val(),
        comment = $task.find('.task-detail textarea').val(),
        originalTask = $task.find('>.col:first'),
        taskDetail = $task.find('>.col:nth-child(2)'),
        tasks;
    for(let task of store){
        if(task.id !== id) continue;
        task.name = name;
        task.deadline = deadline;
        task.comment = comment;
    }
    
    console.log(originalTask, taskDetail)
    originalTask.toggleClass('hide')
    taskDetail.toggleClass('hide')
    tasks = tabType === 'all' ? store : filterStore(tabType);
    render(tasks);
})
// 取消編輯
$tasks.on('click', '.cancel', function(e){
    
    let $task = $(this).closest('.task'),
        originalTask = $task.find('>.col:first'),
        taskDetail = $task.find('>.col:nth-child(2)'),
        id = +$task.data('id'),
        task = store.filter((task) => task.id === id)[0],
        name = task.name,
        deadline = task.deadline,
        comment = task.comment;
    originalTask.toggleClass('hide')
    taskDetail.toggleClass('hide')
    $task.find('.task-name input').val(name).end()
        .find('.task-detail input').val(deadline).end()
        .find('.task-detail textarea').val(comment);

})
// 顯示備註
$tasks.on('click', '.pop-btn', function(e){
    e.currentTarget.firstElementChild.classList.toggle('hide');
    e.currentTarget.classList.toggle('focus');
})