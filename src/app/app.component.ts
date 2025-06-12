import { ChangeDetectorRef, Component, ElementRef, inject, signal } from '@angular/core';
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
  readonly cdr = inject(ChangeDetectorRef);
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
    
    setTimeout(() => {
      // 1. Encontrar el ID más alto actual. Si la lista está vacía, empezamos en 0.
      const maxId = this.todoList.length > 0 ? Math.max(...this.todoList.map(t => t.id)) : 0;
      if (this.todo.value && this.todo.value.trim() !== '') {
        const newTodo: TodoList = {
          id: maxId + 1,
          value: this.todo.value?.trim(),
          isEditable: false,
          completed: false
        }
        this.cdr.detectChanges();
        // --- MEJORA DE INMUTABILIDAD ---
        // En lugar de this.todoList.push(newTodo), creamos un nuevo array.
        // Esto asegura que la detección de cambios de Angular se active correctamente.
        this.todoList = [...this.todoList, newTodo];
        localStorage.setItem('todoList', JSON.stringify(this.todoList));
        this.todo.reset();
        this.errorMessage.set('');
      }
    });
  }

  get todoComplete() {
    const todoListString = localStorage.getItem('todoList');
    const todoList: TodoList[] = todoListString ? JSON.parse(todoListString) : [];
    return todoList.filter((t) => t.completed) || [];
  }

  get todoPending() {
    const todoListString = localStorage.getItem('todoList');
    const todoList: TodoList[] = todoListString ? JSON.parse(todoListString) : [];
    return todoList.filter((t) => !t.completed) || [];
  }

  get todos() {
    const todoListString = localStorage.getItem('todoList');
    const todoList: TodoList[] = todoListString ? JSON.parse(todoListString) : [];
    console.log(todoList)
    return todoList;
  }

  delete(id: number) {
    const todo = this.todoList.find(t => t.id === id);
    const modalRef = this.modal.open(ModalComponent,
      {
        width: '350px',
        height: '200px',
        data: {
          title: 'Eliminar Todo',
          message: `Estas seguro de eliminar la tarea: ${todo?.value}`
        }
      });

    modalRef.afterClosed().subscribe(result => {
      if (!result) return;
      this.todoList = this.todoList.filter((t, i) => t.id !== id);
      localStorage.setItem('todoList', JSON.stringify(this.todoList));
    });
  }

  onToggleComplete(event: { id: number; completed: boolean }) {
    const todoListString = localStorage.getItem('todoList');
    const todoList: TodoList[] = todoListString ? JSON.parse(todoListString) : [];
    setTimeout(() => {
      this.todoList = todoList.map(t =>
        t.id === event.id ? { ...t, completed: event.completed } : t
      );
      localStorage.setItem('todoList', JSON.stringify(this.todoList));
    },0);
  }

  handleRequestEdit(todoToEdit: TodoList) {
    // Primero, nos aseguramos de que ninguna otra tarea esté en modo edición.
    const todoListString = localStorage.getItem('todoList');
    const todoList: TodoList[] = todoListString ? JSON.parse(todoListString) : [];
    todoList.forEach(t => {
      if (t.id !== todoToEdit.id) {
        t.isEditable = false;
        localStorage.setItem('todoList', JSON.stringify(todoList));
      }
    });
    
    // Luego, encontramos la tarea real en nuestra lista y activamos su modo edición.
    const todo = todoList.find(t => t.id === todoToEdit.id);
    if (todo) {
      // Si el valor de isEditable viene en el payload (por el evento blur), lo usamos.
      // Si no, simplemente lo invertimos.
      todo.isEditable = todoToEdit.isEditable !== undefined ? todoToEdit.isEditable : !todo.isEditable;
      localStorage.setItem('todoList', JSON.stringify(todoList));
    }
  }

  saveTodoEdit(event: { value: string, id: number }) {
    const todoListString = localStorage.getItem('todoList');
    const todoList: TodoList[] = todoListString ? JSON.parse(todoListString) : [];
    const todo = todoList.find(t => t.id === event.id);
    if (todo) {
      todo.value = event.value.trim();
      todo.isEditable = false; // Desactivamos el modo edición al guardar.
      localStorage.setItem('todoList', JSON.stringify(todoList));
    }
  }
}
