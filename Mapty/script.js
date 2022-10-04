'use strict';

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

// let map, markerEvenet;

//! Parent class of workout

class Workout {
  date = new Date();

  id = (Date.now() + '').slice(-10);

  constructor(coords, distance, duration) {
    this.coords = coords; // [lnt , lng]
    this.distance = distance; // in km
    this.duration = duration; // in min
  }

  _setDescription() {
    // prettier-ignore
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    this.description = `${this.type[0]?.toUpperCase()}${this.type.slice(
      1
    )} on ${months[this.date.getMonth()]} ${this.date.getDate()}`;
  }
}

//! class Running inherti from Workout

class Running extends Workout {
  type = 'running';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }

  calcPace() {
    this.pace = this.duration / this.duration;
    return this.pace;
  }
}

//! class Cycling inherti from Workout

class Cycling extends Workout {
  type = 'cycling';
  constructor(coords, distance, duration, evelationGain) {
    super(coords, distance, duration);
    this.evelationGain = evelationGain;
    this._setDescription();
  }

  calcSpeed() {
    this.speed = this.duration / (this.distance / 60);
    return this.speed;
  }
}

const run1 = new Running([39, -16], 150, 20, 1025);
const cyc1 = new Cycling([39, -16], 1025, 30, 2596);

console.log(run1, cyc1);

//! Application Architecture
class App {
  #map;

  #markerEvent;

  #zoom = 16;

  #workouts = [];
  constructor() {
    this._getPosition();
    //* get local Storage

    this._getLocalStorage();
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleElevationField);
    containerWorkouts.addEventListener('click', this._moveToMarker.bind(this));
  }

  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        //* Success Function
        this._loadMap.bind(this),
        //* Error Function
        function () {
          alert('Could not get your position');
        }
      );
    }
  }

  _loadMap(position) {
    //   console.log(position);
    console.log(position);
    const { latitude, longitude } = position.coords;

    //   console.log(latitude, longitude);
    //   console.log(position);
    //   console.log(`https://www.google.com/maps/@${latitude},${longitude},15z`);

    const coords = [latitude, longitude];
    this.#map = L.map('map').setView(coords, this.#zoom);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    //   L.marker(coords)
    //     .addTo(map)
    //     .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
    //     .openPopup();

    this.#map.on('click', this._showForm.bind(this));

    this.#workouts.forEach(workout => {
      this._renderWorkouts(workout);
      this.showWorkoutMarker(workout);
    });
  }

  _showForm(markerE) {
    this.#markerEvent = markerE;

    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _newWorkout(e) {
    const inValid = (...inputs) =>
      inputs.every(input => Number.isFinite(input) && input > 0);

    // const isIntegerValid = (...inputs) => inputs.

    const errorMessage = () => alert('Input have to be Positive Numbers');

    //* prevent default handler
    e.preventDefault();

    //* get Data from form

    const type = inputType.value;

    const distance = +inputDistance.value;

    const duration = +inputDuration.value;

    let workout;

    const { lat, lng } = this.#markerEvent.latlng;
    //* Check if the data is valid

    //* if workout is running , create running object
    if (type === 'running') {
      const cadence = +inputCadence.value;
      if (!inValid(distance, duration, cadence)) return errorMessage();

      workout = new Running([lat, lng], distance, duration, cadence);
    }
    //* if workout is Cycling , create Cycling object
    const evelationGain = +inputElevation.value;
    if (type === 'cycling') {
      if (!inValid(distance, duration, evelationGain)) return errorMessage();
      workout = new Cycling([lat, lng], distance, duration, evelationGain);
    }
    //* Add new Object to workout array
    this.#workouts.push(workout);
    console.log(workout);
    //* Render workoutin the list
    this.showWorkoutMarker(workout);

    this._renderWorkouts(workout);
    // console.log(~~lat, ~~lng);

    //* hide form+ clear it
    this._hideForm();

    //* set Local Storage
    this._setLocalStorage();
  }

  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  showWorkoutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 400,
          minWidth: 150,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`
      )
      .openPopup();
  }

  _renderWorkouts(workout) {
    const element = `
      <li class="workout workout--${workout.type}" data-id="${workout.id}">
          <h2 class="workout__title">${workout.description}</h2>
          <div class="workout__details">
            <span class="workout__icon">${
              workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
            }</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${
              workout.type === 'running' ? workout.pace : workout.speed
            }</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">${
              workout.type === 'running' ? '🦶🏼' : '⛰'
            }</span>
            <span class="workout__value">${
              workout.type === 'running'
                ? workout.cadence
                : workout.evelationGain
            }</span>
            <span class="workout__unit">${
              workout.type === 'running' ? 'SPM' : 'M'
            }</span>
          </div>
        </li>

    `;

    form.insertAdjacentHTML('afterend', element);
  }

  _hideForm() {
    inputCadence.value =
      inputDistance.value =
      inputDuration.value =
      inputElevation.value =
        '';
    form.style.display = 'none';
    form.classList.add('hidden');

    setTimeout(() => (form.style.display = 'grid'), 1000);
  }

  _moveToMarker(e) {
    const workoutEl = e.target.closest('.workout');

    // console.log(workoutEl);

    const workout = this.#workouts.find(
      work => work.id === workoutEl.dataset.id
    );

    if (!workout) return;
    this.#map.setView(workout.coords, this.#zoom, {
      animate: true,
      pan: {
        duration: 1.5,
      },
    });
  }

  _setLocalStorage() {
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
  }

  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('workouts'));

    console.log(data);
    if (!data) return;

    this.#workouts = data;

    // this.#workouts.forEach(workout => {
    //   this._renderWorkouts(workout);
    // });
  }
}

const app = new App();

// if (navigator.geolocation) {
//   navigator.geolocation.getCurrentPosition(
//     //* Success Function
//     function (position) {
//       //   console.log(position);
//       const { latitude, longitude } = position.coords;

//       //   console.log(latitude, longitude);
//       //   console.log(position);
//       //   console.log(`https://www.google.com/maps/@${latitude},${longitude},15z`);

//       const coords = [latitude, longitude];
//       map = L.map('map').setView(coords, 13);

//       L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
//         attribution:
//           '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
//       }).addTo(map);

//       //   L.marker(coords)
//       //     .addTo(map)
//       //     .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
//       //     .openPopup();

//       map.on('click', function (markerE) {
//         markerEvenet = markerE;
//         // console.log(markerEvenet);
//         form.classList.remove('hidden');
//         inputDistance.focus();
//       });
//     },

//     //* Error Function
//     function () {
//       alert('Could not get your position');
//     }
//   );
// }

// form.addEventListener('submit', function (e) {
//   //* prevent default handler
//   e.preventDefault();

//   //* displaying workout
//   const { lat, lng } = markerEvenet.latlng;
//   // console.log(~~lat, ~~lng);
//   L.marker([lat, lng])
//     .addTo(map)
//     .bindPopup(
//       L.popup({
//         maxWidth: 400,
//         maxWidth: 150,
//         autoClose: false,
//         closeOnClick: false,
//         className: 'running-popup',
//       })
//     )
//     .setPopupContent('workout!')
//     .openPopup();

//   inputCadence.value =
//     inputDistance.value =
//     inputDuration.value =
//     inputElevation.value =
//       '';

//   form.classList.add('hidden');
// });

// inputType.addEventListener('change', function () {
//   inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
//   inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
// });
