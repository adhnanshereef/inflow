import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

// Interface for parameters
interface Parameter {
  key: string;
  value: string;
}

// Component decorator
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})

// Component class
export class HomeComponent implements OnInit {
  // Variables
  response: any = { message: 'Send a request!' };
  index: string = 'bORp';
  requestForm: FormGroup = new FormGroup({});

  constructor(private formBuilder: FormBuilder, private http: HttpClient) {}

  // Function to initialize the form
  ngOnInit() {
    // Initializing the form
    this.requestForm = this.formBuilder.group({
      type: 'GET',
      url: '',
      body: '{}',
      content_type: 'application/json',
      authorization: this.formBuilder.group({
        check: false,
        value: '',
      }),
      parameters: this.formBuilder.array([]), // Initialize parameters array
      headers: this.formBuilder.array([]), // Initialize headers array
    });

    // Adding a default parameter
    this.addParameter();
    // Adding a default header
    this.addHeader();
  }

  // Getter for authorization value control
  get authorizationValueControl(): FormControl {
    return this.requestForm.get('authorization.value') as FormControl;
  }

  // Getter for authorization type control
  get authorizationCheckControl(): FormControl {
    return this.requestForm.get('authorization.check') as FormControl;
  }

  // Getter for parameters
  get parameters() {
    return this.requestForm.get('parameters') as FormArray;
  }

  // Function to add a parameter
  addParameter() {
    const parameterGroup = this.formBuilder.group({
      key: '',
      value: '',
    });
    this.parameters.push(parameterGroup);
  }

  // Function to remove a parameter
  removeParameter(index: number) {
    this.parameters.removeAt(index);
  }

  // Function to delete all parameters
  deleteAllParameters() {
    this.parameters.clear();
  }

  // Getter for headers
  get headers() {
    return this.requestForm.get('headers') as FormArray;
  }

  // Function to add a header
  addHeader() {
    const headerGroup = this.formBuilder.group({
      key: '',
      value: '',
    });
    this.headers.push(headerGroup);
  }

  // Function to remove a header
  removeHeader(index: number) {
    this.headers.removeAt(index);
  }

  // Function to delete all headers
  deleteAllHeaders() {
    this.headers.clear();
  }

  checkForm() {
    const formData = this.requestForm.value;
    console.log('Form Data:', formData);

    // You can access the parameters like this:
    const parameters = formData.parameters;
    console.log('Parameters:', parameters);

    const headers = formData.headers;
    console.log('Headers:', headers);

    // Iterate through parameters and access key and value:
    for (const param of parameters) {
      console.log('Parameter:', param.key, 'Value:', param.value);
    }

    // Iterate through headers and access key and value:
    for (const header of headers) {
      console.log('Header:', header.key, 'Value:', header.value);
    }

    // Now you can use the formData to make your request or perform other actions
  }

  // To navigate among the tabs
  setIndex(index: string) {
    this.index = index;
  }

  // Function to adjust the height of the textarea
  adjustTextareaHeight(event: any): void {
    const textarea = event.target as HTMLTextAreaElement;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  }

  // Function to send the request
  onSendRequest() {
    // Setting the response to loading
    this.response = 'Loading...';

    // Getting the form values
    let { type, url, body, parameters, content_type } = this.requestForm.value;

    // Preparing the headers
    const headers = this.prepareHeaders();

    // Checking for empty URL
    if (!url) {
      this.response = { alert: 'URL is required.' };
      return;
    }

    // Checking for valid URL
    try {
      new URL(url);
    } catch (error) {
      this.response = 'Invalid URL';
      return;
    }

    // Calling the API
    if (type === 'GET') {
      // Checking for empty parameters
      const validParameters = parameters.filter(
        (param: Parameter) => param.key.trim() !== ''
      );
      // Constructing the full URL with parameters
      const fullUrl =
        validParameters.length > 0
          ? `${url}?${validParameters
              .map((param: Parameter) => `${param.key}=${param.value}`)
              .join('&')}`
          : url;
      // Sending the GET request
      this.http.get(fullUrl, { headers }).subscribe(
        (res) => {
          this.response = res;
        },
        (error) => {
          this.response = error;
        }
      );

      // Completed the GET request
    } else if (type === 'POST') {
      // Checking whether the body is valid JSON
      if (content_type != 'none') {
        try {
          body = JSON.parse(body);
        } catch (error) {
          this.response = 'Invalid JSON body!';
          return;
        }
      }
      // Sending the POST request
      this.http
        .post(url, content_type != 'none' ? body : null, { headers })
        .subscribe(
          (res) => {
            this.response = res;
          },
          (error) => {
            this.response = error;
          }
        );
      // Completed the POST request
    } else {
      // Invalid request type
      this.response = 'Invalid request type!';
    }
    // End of API call
  }
  // End of onSendRequest()

  // Helper function to prepare headers from the form
  prepareHeaders(): HttpHeaders {
    const headerControls = this.headers.controls;
    const tempHeaders: { [key: string]: string } = {}; // Initialize an empty object to store header key-value pairs

    // Iterate through the headers array and add key-value pairs to the object
    headerControls.forEach((control) => {
      const keyControl = control.get('key');
      const valueControl = control.get('value');
      if (keyControl && valueControl) {
        const key = keyControl.value.trim();
        const value = valueControl.value.trim();
        if (key !== '') {
          tempHeaders[key] = value; // Dynamically add key-value pair to the object
        }
      }
    });

    // Checking for content type and adding it to the headers if it is not none
    if (this.requestForm.value.content_type !== 'none') {
      tempHeaders['Content-Type'] = this.requestForm.value.content_type;
    }

    // Checking for authorization and adding it to the headers if it is not empty
    if (
      this.authorizationCheckControl.value &&
      this.authorizationValueControl.value !== ''
    ) {
      tempHeaders['Authorization'] = this.authorizationValueControl.value;
    }

    console.log(tempHeaders);

    // Convert the object into HttpHeaders
    const headers = new HttpHeaders(tempHeaders); // Convert the object into HttpHeaders

    return headers;
  }
  // End of prepareHeaders()
}
