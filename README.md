# fis3-command-install
get npm packager from fis-conf.js at the current directory and install

### install
```
npm i -g fis3-command-install
```

### how to use
```
// -g is optional, install npm packager globally or locally.
fis3 install -g
```


### detect
use npm view packager to detect existence of packager.

### problem
main problem is how to detect a local installation. By use npm list, it will just list all packagers in curren directory in node_modules. However, by use npm list -g, it will list all global packagers.
