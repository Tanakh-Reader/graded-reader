<!-- Improved compatibility of back to top link: See: https://github.com/othneildrew/Best-README-Template/pull/73 -->
<a name="readme-top"></a>

<!--
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url] -->
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]



<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/Tanakh-Reader/graded-reader">
    <img src="https://github.com/Tanakh-Reader/tanakh-reader/blob/revamped-onion-architecture/logo/logo.png" alt="Logo" width="160" height="160">
  </a>

  <h3 align="center">Graded Hebrew Reader</h3>

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

<a href="https://github.com/Tanakh-Reader/tanakh-reader">
    <img src="https://github.com/Tanakh-Reader/tanakh-reader/blob/revamped-onion-architecture/screenshot.png" alt="Logo" width="250">
</a>

This project is a joint research effort of Seth Howell and Dr. Jesse Scheumann that aims to assess the difficulty of Hebrew passages by considering various linguistic factors such as word frequency, morphological complexity, syntactic complexity, verb types, vocabulary diversity, semantic complexity, text genre, and thematic familiarity.

### Built With

- Python
- Django

## Getting Started

To get a local copy up and running, follow these steps:

### Prerequisites

- Python 3.8 or higher
- pip

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/Tanakh-Reader/graded-reader.git
   ```
2. Navigate to the working directory
   ```sh
   cd vanilla-app
   ```
3. Install required Python packages
   ```sh
   poetry install --no-root
   ```
4. Run the app with poetry 
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
