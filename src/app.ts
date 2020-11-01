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

enum ProjectStatus { Active, Finished };

// Project class
class Project {
    constructor(
        public id: string,
        public title: string,
        public description: string,
        public people: number,
        public status: ProjectStatus
    ) {}
}

type Listener = (items: Project[]) => void

// Project State Management

class ProjectState {
  private projects: Project[] = [];
  private listeners: Listener[] = [];
  private static instance: ProjectState;

  private constructor() {}

  static getInstance(): ProjectState {
    if (!this.instance) {
      this.instance = new ProjectState();
    }

    return this.instance;
  }

  public addListener(listenerFn: Listener) {
    this.listeners.push(listenerFn);
  }

  public addProject(title: string, description: string, people: number): void {
    const project = new Project(
        Math.random().toString(),
        title,
        description,
        people,
        ProjectStatus.Active
    );

    this.projects.push(project);

    for (const listenerFn of this.listeners) {
      listenerFn([ ...this.projects ]);
    }
  }
}

const globalState = ProjectState.getInstance();

// ProjectList class
class ProjectList {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLElement;
  assignedProjects: Project[] = [];

  constructor(private type: 'active' | 'finished') {
    this.templateElement = <HTMLTemplateElement>document.getElementById('project-list');
    this.hostElement = <HTMLDivElement>document.getElementById('app');

    const importedNode = document.importNode(this.templateElement.content, true);
    this.element = <HTMLElement>importedNode.firstElementChild;
    this.element.id = `${this.type}-projects`;

    globalState.addListener((projects: Project[]) => {
      this.assignedProjects = projects;
      this.renderProjects();
    });

    this.attach();
    this.renderContent();
  }

  private renderContent(): void {
    this.element.querySelector('ul')!.id = `${this.type}-projects-list`;
    this.element.querySelector('h2')!.textContent = `${this.type.toUpperCase()} PROJECTS`;
  }

  private renderProjects(): void {
    const listElement = <HTMLUListElement>document.getElementById(`${this.type}-projects-list`);
    listElement.textContent = '';

    for (const projectItem of this.assignedProjects) {
      const listItem = document.createElement('li');
      listItem.textContent = projectItem.title;
      listElement.appendChild(listItem);
    }
  }

  private attach() {
    this.hostElement.insertAdjacentElement('beforeend', this.element);
  }
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
      globalState.addProject(title, description, people);

      this.clearInputs();
    }
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

    if (
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
}

const projectInput = new ProjectInput();
const activeProjectList = new ProjectList('active');
const finishedProjectList = new ProjectList('finished');
