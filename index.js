/* global exprots */

exports.name = 'install';
exports.usage = '<template>';
exports.desc = 'install fis npm packager in fis-conf.js';

var path = require('path'),
    fs = require('fs'),
    child_process = require('child_process');


var spawn = child_process.spawn,
    exec = child_process.exec;


// var PLUGIN_REG = /fis\.plugin\([\'\"]([^\'\"]*)[\'\"]/img;

var PLUGIN_REG = /(\w*)\s*:\s*\[?\s*fis\.plugin\([\'\"]([^\'\"]*)[\'\"]/img;


//  multy
var MULTY_REG = /(parser|prepackager|packager|postpackager|deploy)\s*:\s*\[([^\[\]]*)\]/img;

// single
var SINGLE_REG = /(parser|prepackager|packager|postpackager|deploy)\s*:\s*fis\.plugin\([\'\"]([^\'\"]*)[\'\"]/img;


var PLUGIN_FREFIX = /fis\.plugin\([\'\"]([^\'\"]*)[\'\"]/img;

var PREFIX = /(parser|prepackager|packager|postpackager|deploy)\s*:\s*/;

function unique(array) {
    return array.filter(function(elem, i, arr) {
        return arr.indexOf(elem) === i;
    });
}

// match multy plugins, as follows:
// deploy: [fis.plugin()]
function getMultyPlugins(content) {

    var multyMatches = content.match(MULTY_REG),
        plugins = [];
    if (multyMatches) {

        multyMatches = unique(multyMatches);
        for (var i = 0; i < multyMatches.length; i++) {
            var _matches = multyMatches[i].match(PREFIX);
            if (_matches) {
                var _plugins = multyMatches[i].replace(PREFIX, '');
                var _pluginsMatches = _plugins.match(PLUGIN_FREFIX);
                _pluginsMatches = unique(_pluginsMatches);
                _pluginsMatches.forEach(function(m, i) {
                    _pluginsMatches[i] = _pluginsMatches[i].replace(/fis\.plugin\([\'\"]/, '').replace(/[\'\"]/, '');
                    plugins.push(_matches[1] + '-' + _pluginsMatches[i]);
                });
            }
        };
    }
    return plugins;
}

// match single plugin, as follows:
// deploy: fis.plugin()
function getSinglePlugin(content) {
    var singleMatches = content.match(SINGLE_REG),
        plugins = [];
    if (singleMatches) {
        singleMatches = unique(singleMatches);
        for (var i = 0, l = singleMatches.length; i < l; ++i) {
            singleMatches[i] = singleMatches[i].replace(/fis\.plugin\([\'\"]/img, '').replace(/[\'\"]/, '');
            var _matches = singleMatches[i].match(PREFIX);
            if (_matches) {
                plugins.push(_matches[1] + '-' + singleMatches[i].replace(PREFIX, ''));
            }
        }
    }
    return plugins;
}

/*
 * @TODO
 * 1. how to detect to install fis-xxx or fis3-xxx
 */
exports.register = function() {
    var root = process.cwd(),
        conf = path.join(root, 'fis-conf.js'),
        version = fis.version,
        isFis3 = parseInt(version.charAt(0)) === 3;

    var params = process.argv.slice(3);
    if (fs.existsSync(conf)) {
        var content = fs.readFileSync(conf, 'utf-8'),
            plugins = [];

        plugins = getSinglePlugin(content).concat(getMultyPlugins(content));

        plugins = unique(plugins);
        // how to judge packager prefix is fis or fis3
        var cmd = 'npm i ';
        if (params.length && params[0] === '-g') {
            cmd += '-g ';
        }

        if (isFis3) {
            // install two npm packagers. rude
            plugins.forEach(function(p) {
                (function(plugin) {
                    var child;
                    exec('npm view ' + 'fis3-' + plugin, function(err) {
                        if (err) {
                            console.log('installing fis-' + plugin);
                            child = child_process.exec(cmd + 'fis-' + plugin, function(e, out) {
                                console.log(out);
                            });
                        } else {
                            console.log('installing fis3-' + plugin);
                            child = child_process.exec(cmd + 'fis3-' + plugin, function(e, out) {
                                console.log(out);
                            });
                        }
                    });
                })(p);
            });
        }

    }
};
