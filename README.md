# Dabus the gulp builder

Explore `example_project` to see dabus in action.

Will be adding more documentation in the near future

### Preperations for example project
```
cd example_project;
npm install;
```

### Build project
```
gulp build -s 0 -m 1 -e production
```

### Serve project in dev mode (browserSync)
```
gulp serve
```

### gulp arguments
 - -s (0/1) - build with sourcemaps or not (css and js) - default: 1
 - -m (0/1) - build minified/uglified (css and js) - default: 0
 - -e (string) - build for this enviroment - default: development
