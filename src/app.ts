//validation
interface Validator {
  value: string | number;
  required: boolean;
  min?: number;
  max?: number;
}

function validate({ value, required, min, max }: Validator): boolean {
  let isValid = true;
  //check if it's required and trim and check if exist
  if (required) {
    isValid = value.toString().trim().length > 0;
  }

  //check if values is a string or number
  if ((min || max) && isValid) {
    switch (typeof value) {
      case 'string':
        //check min and max for string
        if (min) {
          isValid = value.length >= min;
        } 
        if (max) {
          isValid = value.length <= max;
        }

        break;
      case 'number':
        //check min and max for number
        if (min) {
          isValid = value >= min;
        } 
        if (max) {
          isValid = value <= max;
        }

        break;
    }
  }

  return isValid;
}

// autobind decorator
function autobind(_targer: Object, _methodName: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      return originalMethod.bind(this);
    },
  };
  return adjDescriptor;
}

// ProjectInput Class
class ProjectInput {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLFormElement;
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    this.templateElement = <HTMLTemplateElement>document.getElementById('project-input')!;
    this.hostElement = <HTMLDivElement>document.getElementById('app')!;

    const importedNode = document.importNode(this.templateElement.content, true);
    this.element = <HTMLFormElement>importedNode.firstElementChild;
    this.element.id = 'user-input';

    this.titleInputElement = <HTMLInputElement>this.element.querySelector('#title');
    this.descriptionInputElement = <HTMLInputElement>this.element.querySelector('#description');
    this.peopleInputElement = <HTMLInputElement>this.element.querySelector('#people');

    this.configure();
    this.attach();
  }

  @autobind
  private submitHandler(event: Event) {
    event.preventDefault();
    const userInput = this.gatherUserInput();

    if (Array.isArray(userInput)) {
      const [title, description, people] = userInput;
      this.log({ title, description, people });
    }

    this.clearInputs();
  }

  private configure() {
    this.element.addEventListener('submit', this.submitHandler);
  }

  private attach() {
    this.hostElement.appendChild(this.element);
  }

  private gatherUserInput(): [string, string, number] | void {
    const enteredTitle = this.titleInputElement.value;
    const enteredDescription = this.descriptionInputElement.value;
    const enteredPeople = this.peopleInputElement.value;

    // check if are valid
    // if NOT fire an alert and return 'undefined'
    //   if(
    //       enteredTitle.trim().length === 0 ||
    //       enteredDescription.trim().length === 0 ||
    //       enteredPeople.trim().length === 0
    //   ) {
    //     alert('Invalid Input, please try again!');
    //     return;
    //   }
    if(
        !validate({ value: enteredTitle, required: true }) ||
        !validate({ value: enteredDescription, required: true, min: 5 }) ||
        !validate({ value: +enteredPeople, required: true, min: 1, max: 5 }) 
    ) {
        alert('Invalid Input, please try again!');
        return;
    }

    // if yes return a tuple
    return [enteredTitle, enteredDescription, +enteredPeople];
  }

  private clearInputs(): void {
    (this.titleInputElement.value = ''), (this.descriptionInputElement.value = '');
    this.peopleInputElement.value = '';
  }

  private log(el: any) {
    console.log(`🔥 `, { el });
  }
}

const projectInput = new ProjectInput();
