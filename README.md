# Misinformation Awareness Browser Extension

This project aims to help stop the growing spread of misinformation and disinformation in the online community. It provides a browser extension that alerts users when they visit websites flagged for harmful or misleading content, encouraging caution before engaging.

## Purpose
This browser extension is designed to increase awareness about misinformation by warning users when they encounter flagged websites.

## Functionality / Description

The extension works by cross-referencing the URL of websites that users visit with a pre-defined list of flagged domains stored in a `.csv` file. If the site is found in this file, the extension alerts the user:

- **Icon 1**: A **red circle with a white exclamation mark** indicates that the website has been flagged for misinformation or disinformation.
- **Icon 2**: A **gray circle** signals caution for sites with no definitive information in the CSV, reminding users to be vigilant.

### How It Works
1. A script reads entries from a `.csv` file listing websites identified for misinformation.
2. Whenever a user visits a new site, the extension cross-checks the current URL with entries in the `.csv` file.
3. If a match is found, the extension displays a warning icon.

## Icons

- **Red Circle with Exclamation**: Appears when the visited website has been flagged for misinformation or disinformation.
- **Gray Circle**: Indicates caution for sites without specific data on misinformation but encourages users to be careful.

## Authors
- [Vernika Jain](https://github.com/vernikaj)
- [Sruthi Malisetty](https://github.com/sruthi120304)
- Jhanvi Mittal
- [Saanvi Sampada](https://github.com/ksampada23) 
- Aniruddh Srivastava
- Adarsh Veerapaneni

## Acknowledgements
- [GitHub with Cleaned Sources and Ratings](https://github.com/JanaLasser/misinformation_domains/tree/main)
 
