<!-- Improved compatibility of back to top link: See: https://github.com/othneildrew/Best-README-Template/pull/73 -->
<a name="readme-top"></a>

<!--
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url] -->
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]



<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/Tanakh-Reader/tanakh-reader">
    <img src="https://github.com/Tanakh-Reader/tanakh-reader/blob/revamped-onion-architecture/logo/logo.png" alt="Logo" width="160" height="160">
  </a>

  <h3 align="center">Hebrew Graded Reader</h3>

  <p align="center">Assessing the readability of Hebrew pericopes</p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <!-- <li><a href="#usage">Usage</a></li> -->
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

<a href="https://raw.githubusercontent.com/Tanakh-Reader/graded-reader/main/graded-reader.png">
    <img src="https://github.com/Tanakh-Reader/graded-reader/blob/main/graded-reader.png" alt="Logo" width="400">
</a>

This project is a joint research effort of Seth Howell and Dr. Jesse Scheumann that aims to assess the difficulty of Hebrew passages by considering various linguistic factors such as word frequency, morphological complexity, syntactic complexity, verb types, vocabulary diversity, semantic complexity, text genre, and thematic familiarity.

### Built With

- Python
- Django

## Getting Started

To get a local copy up and running, follow these steps:

### Prerequisites

- Python 3.9 or higher
- pip
- npm

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/Tanakh-Reader/graded-reader.git
   ```
2. Navigate to the working directory
   ```sh
   cd vanilla-app
   ```
3. Install required npm packages
   ```sh
   npm install
   ```
* Note: if you plan to make changes to app/static/css/tailwind.css, run:
  ```sh
  npm run watch
  ```
4. Install required Python packages
   ```sh
   poetry install --no-root
   ```
5. Run the app with poetry 
   ```sh
   poetry run python3 manage.py runserver
   ```


## Usage

Run the app and head to http://127.0.0.1:8000/ to utilize the features.

## Roadmap

- [x] Develop initial metrics for assessing Hebrew passage difficulty
- [ ] Improve and refine metrics
- [ ] Implement a user-friendly interface
- [ ] Optimize performance and efficiency

## Contributing

Contributions are welcome and appreciated! To contribute:

1. Fork the project
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add YourFeature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a pull request

## License

This project is licensed under the MIT License - see the `LICENSE.txt` file for details.

## Contact

Seth Howell - hebrewliteracyapp@gmail.com

Project Link: [https://github.com/Tanakh-Reader/graded-reader.git](https://github.com/YourUsername/Hebrew-Passage-Difficulty-Assessment)

## Acknowledgments

- Dr. Jesse Scheumann
- James Tauber
- GPT 4
- [README-Template](https://github.com/othneildrew/Best-README-Template)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/othneildrew/Best-README-Template.svg?style=for-the-badge
[contributors-url]: https://github.com/Tanakh-Reader/tanakh-reader/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/othneildrew/Best-README-Template.svg?style=for-the-badge
[forks-url]: https://github.com/Tanakh-Reader/tanakh-reader/network/members
[stars-shield]: https://img.shields.io/github/stars/othneildrew/Best-README-Template.svg?style=for-the-badge
[stars-url]: https://github.com/othneildrew/Best-README-Template/stargazers
[issues-shield]: https://img.shields.io/github/issues/othneildrew/Best-README-Template.svg?style=for-the-badge
[issues-url]: https://github.com/Tanakh-Reader/tanakh-reader/issues
[license-shield]: https://img.shields.io/github/license/othneildrew/Best-README-Template.svg?style=for-the-badge
[license-url]: https://github.com/Tanakh-Reader/tanakh-reader/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://www.linkedin.com/in/seth-henry/
[product-screenshot]: images/screenshot.png
[Next.js]: https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[Next-url]: https://nextjs.org/
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[Vue.js]: https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D
[Vue-url]: https://vuejs.org/
[Angular.io]: https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white
[Angular-url]: https://angular.io/
[Svelte.dev]: https://img.shields.io/badge/Svelte-4A4A55?style=for-the-badge&logo=svelte&logoColor=FF3E00
[Svelte-url]: https://svelte.dev/
[Laravel.com]: https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white
[Laravel-url]: https://laravel.com
[Bootstrap.com]: https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white
[Bootstrap-url]: https://getbootstrap.com
[JQuery.com]: https://img.shields.io/badge/jQuery-0769AD?style=for-the-badge&logo=jquery&logoColor=white
[JQuery-url]: https://jquery.com 
