import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';

interface FormField {
  name: string;
  type: string;
  label: string;
  options?: { value: any; label: string }[];
}

@Component({
  selector: 'dynamic-form',
  templateUrl: 'dynamic-form.component.html',
  standalone: true,
  imports: [ ReactiveFormsModule, CommonModule ],
})

export class DynamicFormComponent {
  @Input() schema: { fields: FormField[] };
  @Input() submitButtonText: string = 'Submit';
  @Output() submitted = new EventEmitter<any>();

  form: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.form = this.createFormGroup();
  }

  createFormGroup(): FormGroup {
    const group: any = {};

    this.schema.fields.forEach(field => {
      group[field.name] = new FormControl('');
    });

    return this.fb.group(group);
  }

  onSubmit() {
    this.submitted.emit(this.form.value);
  }
}
