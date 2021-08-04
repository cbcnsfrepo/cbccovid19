# Prerequiresites
- node package manager (npm)

# Instructions

1. The local repository can be ran and tested after cloning the repository.
2. In command line (linux environment):
    - First we setup webapp repository and submodules
        1. ```cd webapp_codebase/igv_webapp```
        2. ```npm install```
        3. ```npm run build```
        
        There should be a dist/* folder generated.
    - Now we setup igv.js (backend support for the webapp)
        1. ```cd webapp_codebase/igv_js```
        2. ```npm run build```
        
        There should be files created under dist/* folder.

        4. ```mv dist/igv.min.js ../igv_webapp/dist``` 
        5. Navigate back to igv_webapp/dist directory and in root directory:
            - ```npx http-server -a localhost```
            - Make sure there is a datafiles folder that contains the necessary datafiles to load.
3. Open up web browser (preferablly chrome or firebox have debugger console) on ```localhost:8080```
    - To avoid caching issues, use incognito tabs. (Still in process of fixing, although cache is disabled from HTML settings)
