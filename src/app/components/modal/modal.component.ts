import { ChangeDetectionStrategy, Component, inject, signal } from "@angular/core";
import { MatProgressBarModule } from '@angular/material/progress-bar';
import {
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
  MAT_DIALOG_DATA
} from '@angular/material/dialog';

export interface ConfirmDialogData {
  title: string;
  message: string;
}

@Component({
    templateUrl: './modal.component.html',
    imports: [
        MatDialogActions, 
        MatDialogTitle, 
        MatDialogContent,
        MatProgressBarModule
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalComponent{
    readonly dialogRef = inject(MatDialogRef<ModalComponent>);
    readonly data:ConfirmDialogData = inject(MAT_DIALOG_DATA);
    isLoading:boolean = false;
    value = signal(0);

    confirm(){
        this.isLoading = true;
        let aux = 0;
        
        let interval = setInterval(() => {
            aux+=3;
            this.value.set(aux);
            if(aux > 100){
                clearInterval(interval);
                this.value.set(0)
                this.isLoading = false;
                this.dialogRef.close(true);
            }
        }, 100);
    }

    cancel(){
        this.isLoading = true;
        let aux = 0;
        
        let interval = setInterval(() => {
            aux+=3;
            this.value.set(aux);
            if(aux > 100){
                clearInterval(interval);
                this.value.set(0)
                this.isLoading = false;
                this.dialogRef.close(false);
            }
        }, 100);
    }

}