import { Component, ElementRef, EventEmitter, Input, Output, QueryList, ViewChildren } from "@angular/core";
import { TodoList } from "../../app.component";
import { MatListModule } from "@angular/material/list";
import { MatIconModule } from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';

@Component({
    imports: [
        MatListModule,
        MatIconModule,
        MatTooltipModule,
    ],
    selector: 'app-todo-list',
    templateUrl: './todoList.component.html'
})
export class TodoListApp {
    @Input() todos: TodoList[] = [];
    @ViewChildren('todoInput') todoInputs!: QueryList<ElementRef>;
    @Output() deleteTodo = new EventEmitter<number>();

    onDelete(id: number){
        this.deleteTodo.emit(id);
    }

    edit(id: number, event: Event) {
        event.stopPropagation();
        const todoToEdit = this.todos.find(t => t.id === id);
        if (todoToEdit) todoToEdit.isEditable = true
        setTimeout(() => {
            const input = this.todoInputs.find(t => t.nativeElement.id === id.toString());
            input?.nativeElement?.focus();
        });
    }

    editTodo(id: number, event: Event) {
        event.stopPropagation();
        const input = event.target as HTMLInputElement;
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.value = input.value;
            todo.isEditable = false;
        }
    }

    markTodoOk(event: boolean, todo: TodoList) {
        setTimeout(() => {
            todo.completed = event;
        });
    }
}