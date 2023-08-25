import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  requestForm = this.formBuilder.group({ type: 'POST', url: '', body: '{}' });
  response: any = { "message": "Send a request!" };
  index: string = 'bORp';
  
  constructor(private formBuilder: FormBuilder, private http: HttpClient) {}
  
  setIndex(index: string) {
    this.index = index;
  }

  adjustTextareaHeight(event: any): void {
    const textarea = event.target as HTMLTextAreaElement;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = (textarea.scrollHeight) + 'px';
    }
  }


  onSendRequest() {
    this.response = 'Loading...';
    let { type, url, body } = this.requestForm.value;
    url = url?.toString() || '';
    try {
      new URL(url);
    } catch (error) {
      this.response = 'Invalid URL';
      return;
    }
    body = body?.toString() || '{}';

    if (type === 'GET') {
      this.http.get(url).subscribe(
        (res) => {
          this.response = res;
        },
        (error) => {
          this.response = error;
        }
      );
    } else if (type === 'POST') {
      try {
        body = JSON.parse(body);
      } catch (error) {
        this.response = 'Invalid JSON body!';
        return;
      }
      this.http.post(url, body).subscribe(
        (res) => {
          this.response = res;
        },
        (error) => {
          this.response = error;
        }
      );
    } else {
      this.response = 'Invalid request type!';
    }
  }
}
