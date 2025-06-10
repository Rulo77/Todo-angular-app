import { Component, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { merge } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';
import { TodoListApp } from "./components/todoList/todoList.component";
import { MatDialog } from '@angular/material/dialog';
import { ModalComponent } from './components/modal/modal.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';


export interface TodoList {
  id: number;
  value: string;
  isEditable: boolean;
  completed: boolean;
}

@Component({
  selector: 'app-root',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatListModule,
    MatTabsModule,
    TodoListApp,
    MatProgressBarModule
  ],
  templateUrl: './app.component.html'
})
export class AppComponent {
  // @ViewChildren('todoInput') todoInputs!: QueryList<ElementRef>;
  readonly todo = new FormControl('', [Validators.required]);
  todoList: TodoList[] = [];

  errorMessage = signal('');

  readonly modal = inject(MatDialog);

  constructor() {
    merge(this.todo.statusChanges, this.todo.valueChanges)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.updateErrorMessage());
  }

  updateErrorMessage() {
    if (this.todo.hasError('required')) {
      this.errorMessage.set('valor requerido');
    } else {
      this.errorMessage.set('');
    }
  }

  addTodo() {
    if (this.todo.value && this.todo.value.trim() !== '') {
      const todoList: TodoList = {
        id: this.todoList.length + 1,
        value: this.todo.value,
        isEditable: false,
        completed: false
      }
      this.todoList.push(todoList);
      this.todo.setValue('');
      this.errorMessage.set('');
    }
  }

  get todoComplete() {
    return this.todoList.filter((t) => !t.completed) || [];
  }

  get todoPending() {
    return this.todoList.filter((t) => t.completed) || [];
  }

  delete(id: number) {
    const todo = this.todoList.find(t => t.id === id);
    const modalRef = this.modal.open(ModalComponent, 
    { 
      width: '350px', 
      height: '200px', 
      data: {
        title: 'Eliminar Todo',
        message: `Estas seguro de eliminar la tarea: ${todo?.value}`} 
    });

    modalRef.afterClosed().subscribe(result => {
      if (!result) return;
      this.todoList = this.todoList.filter((t, i) => t.id !== id);
    });
  }
}
