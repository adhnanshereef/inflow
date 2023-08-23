import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  requestForm = this.formBuilder.group({ type: 'GET', url: '', body: '{}' });
  response: string = 'Send a request!';
  constructor(private formBuilder: FormBuilder, private http: HttpClient) {}
  onSendRequest() {
    this.response = 'Loading...';
    let { type, url, body } = this.requestForm.value;
    url = url?.toString() || '';
    body = body?.toString() || '{}';

    if (type === 'GET') {
      this.http.get(url).subscribe((res) => {
        console.log(res);
        this.response = JSON.stringify(res);
      });
    } else if (type === 'POST') {
      this.http.post(url, JSON.parse(body)).subscribe((res) => {
        console.log(res);
        this.response = JSON.stringify(res);
      });
    }else{
      this.response = 'Invalid request type!';
    }
  }
}
