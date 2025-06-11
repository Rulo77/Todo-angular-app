import { ChangeDetectorRef, Component, ElementRef, EventEmitter, inject, Input, Output, QueryList, ViewChildren } from "@angular/core";
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

    @Output() deleteTodo = new EventEmitter<number>();
    @Output() toggleComplete = new EventEmitter<{ id: number, completed: boolean }>();
    
    @Output() sendEditTodo = new EventEmitter<{ value: string, id: number }>();
    @Output() requestEdit = new EventEmitter<TodoList>();
    
    @ViewChildren('todoInput') todoInputs!: QueryList<ElementRef<HTMLInputElement>>;

    readonly cdr = inject(ChangeDetectorRef);

    onDelete(id: number){
        this.deleteTodo.emit(id);
    }

    startEditMode(todo: TodoList, event:Event) {
        event?.stopPropagation();
        todo.isEditable = true;
        this.requestEdit.emit(todo);
        this.cdr.detectChanges();
        setTimeout(()=>{
            const input = this.todoInputs.find(t => t.nativeElement.id === todo.id.toString());
            input?.nativeElement.focus();
        }, 0 );
    }

    finishEdit(todo: TodoList, event:Event) {
        event.stopPropagation();
        const input = event.target as HTMLInputElement;

        if (input.value !== todo.value) {
           this.sendEditTodo.emit({ value: input.value, id: todo.id });
        } else {
           // Si no hay cambio, simplemente salimos del modo edición
           this.requestEdit.emit({ ...todo, isEditable: false });
        }
    }

    markTodoOk(event: boolean, todo: TodoList) {
        this.toggleComplete.emit({ id: todo.id, completed: event });
    }
}