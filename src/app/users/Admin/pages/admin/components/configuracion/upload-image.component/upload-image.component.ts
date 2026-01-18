import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-upload-image',
  templateUrl: './upload-image.component.html',
  styleUrls: ['./upload-image.component.css'],
  imports: [CommonModule],
})
export class UploadImageComponent {

  @Output() imageSelected = new EventEmitter<File>();

  previewUrl: string | ArrayBuffer | null = null;
  selectedFile!: File;

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      this.selectedFile = file;
      this.imageSelected.emit(file); // 🔥 EMITE AL PADRE

      const reader = new FileReader();
      reader.onload = () => this.previewUrl = reader.result;
      reader.readAsDataURL(file);
    }
  }
}
