import { Component, OnInit } from '@angular/core';
import { Task } from '../task';
import { TasksService } from '../tasks.service';
import { forkJoin, Observable } from 'rxjs';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
export class TasksComponent implements OnInit{
  public tasks: Task[] = [];
  public newTask: Task = {};
isProcessing: any;

  constructor(private tasksService: TasksService){}

  ngOnInit(): void {
      this.tasksService.index().subscribe((tasks) => {
        this.tasks = tasks
      })
  }

  addTask() :void{
    if (this.newTask.title === undefined){
      return;
    }
    this.newTask.completed = false;
    this.newTask.archived = false;

    this.tasks.unshift(this.newTask);

    this.tasksService.post(this.newTask).subscribe((task) :void =>{
      this.newTask = {};
      this.ngOnInit();
    })
  }

  handleChange(task: Task) {
    this.tasksService.put(task).subscribe({
      error: err => {
        alert(err);
        this.ngOnInit();
      }
    });
  }

  archiveCompleted() :void {
    let observables: Observable<any>[] = [];
    for (const task of this.tasks){
      if (!task.completed){
        continue;
      }
      task.archived = true;
      observables.push(this.tasksService.put(task));
    }
    forkJoin(observables).subscribe(() => {
      this.ngOnInit()
    })
  }
  
  canArchiveCompleted() {
    for (const task of this.tasks) {
      if (task.completed) {
        return true;
      }
    }
    return false;
  }

  canAddTask() {
    if (this.isProcessing) {
      return false;
    }

    return !!this.newTask.title;
  }


}
