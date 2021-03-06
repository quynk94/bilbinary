/* -*- indent-tabs-mode: nil; js-indent-level: 2 -*-
 *
 * Copyright (c) 2017 Sony Global Education, Inc.
 */

'use strict';

const rewire = require('rewire');
const assert = require('assert');

const { compactify, uncompactify } = require('../compactify.js');

describe('compactify empty array', function() {
  const cbil = compactify([]);

  it('should be empty array', function() {
    assert.deepEqual(cbil, []);
  });
});

describe('compactify immediate', function() {
  it('should return number if number is given', function() {
    const cbil = compactify(3.14);
    assert.deepEqual(cbil, 3.14);
  });
  it('should return string if string is given', function() {
    const cbil = compactify('3.14');
    assert.deepEqual(cbil, '3.14');
  });
});

describe('build_fvlmap', function() {
  it('should return fvlmap', function() {
    const compactify = rewire('../compactify.js');
    const build_fvlmap = compactify.__get__('build_fvlmap');

    assert.deepEqual(build_fvlmap([
    ]), {
      'when-green-flag-clicked': {},
      "locals": {},
      "function": {},
      "list": {},
      "variable": {},
      "image": {} });

    assert.deepEqual(build_fvlmap([
      { name: 'function', function: 'f1', blocks: [] }
    ]), {
      'when-green-flag-clicked': {},
      "locals": { 'f1': {} },
      "function": { 'f1': 0 },
      "list": {},
      "variable": {},
      "image": {} });

    assert.deepEqual(build_fvlmap([
      { name: 'function', function: 'f1', blocks: [] },
      { name: 'function', function: 'f2', blocks: [] }
    ]), {
      'when-green-flag-clicked': {},
      "locals": { 'f1': {}, 'f2': {} },
      "function": { 'f1': 0, 'f2': 1 },
      "list": {},
      "variable": {},
      "image": {} });

    assert.deepEqual(build_fvlmap([
      { name: 'function',
        function: 'f1',
        args: [ { variable: 'p' }, { variable: 'q' } ],
        blocks: [] },
      { name: 'function',
        function: 'f2',
        args: [ { variable: 'x' }, { variable: 'y' } ],
        blocks: [] }
    ]), {
      'when-green-flag-clicked': {},
      "locals": {
        "f1": { "p": -1, "q": -2 },
        "f2": { "x": -1, "y": -2 }
      },
      "function": { 'f1': 0, 'f2': 1 },
      "list": {},
      "variable": {},
      "image": {} });

    assert.deepEqual(build_fvlmap([
      { name: 'function',
        function: 'f1',
        locals: [ { variable: 'p', value: 0 }, { variable: 'q', value: 1 } ],
        blocks: [] },
      { name: 'function',
        function: 'f2',
        args: [ { variable: 'x' }, { variable: 'y' } ],
        blocks: [] }
    ]), {
      'when-green-flag-clicked': {},
      "locals": {
        'f1': { "p": -1, "q": -2 },
        'f2': { "x": -1, "y": -2 } },
      "function": { 'f1': 0, 'f2': 1 },
      "list": {},
      "variable": {},
      "image": {} });

    assert.deepEqual(build_fvlmap([
      { name: 'function',
        function: 'f1',
        args: [ { variable: 'x' }, { variable: 'y' } ],
        locals: [ { variable: 'p', value: 0 }, { variable: 'q', value: 1 } ],
        blocks: [] },
      { name: 'function',
        function: 'f2',
        args: [ { variable: 'x' }, { variable: 'y' } ],
        locals: [ { variable: 'u', value: 2 }, { variable: 'v', value: 3 } ],
        blocks: [] }
    ]), {
      'when-green-flag-clicked': {},
      "locals": {
        'f1': { "x": -1, "y": -2, "p": -3, "q": -4 },
        'f2': { "x": -1, "y": -2, "u": -3, "v": -4 } },
      "function": { 'f1': 0, 'f2': 1 },
      "list": {},
      "variable": {},
      "image": {} });

    assert.deepEqual(build_fvlmap([
      { name: 'when-green-flag-clicked',
        locals: [ { variable: 'p', value: 0 }, { variable: 'q', value: 1 } ],
        blocks: [] },
      { name: 'function',
        function: 'when-green-flag-clicked',
        args: [ { variable: 'x' }, { variable: 'y' } ],
        locals: [ { variable: 'u', value: 2 }, { variable: 'v', value: 3 } ],
        blocks: [] }
    ]), {
      'when-green-flag-clicked': { locals: { "p": -1, "q": -2 } },
      "locals": {
        'when-green-flag-clicked': { "x": -1, "y": -2, "u": -3, "v": -4 } },
      "function": { 'when-green-flag-clicked': 0 },
      "list": {},
      "variable": {},
      "image": {} });

    assert.deepEqual(build_fvlmap([
      { name: 'when-green-flag-clicked',
        blocks: [] },
      { name: 'image',
        image: 'image-1',
        width: 3,
        height: 5,
        format: 'grb',
        pixels: [
          100, 0, 0
        ] },
      { name: 'image',
        image: 'image-2',
        width: 3,
        height: 5,
        format: 'grb',
        pixels: [
          100, 0, 0
        ] }
    ]), {
      'when-green-flag-clicked': { locals: {} },
      "locals": {},
      "function": {},
      "list": {},
      "variable": {},
      "image": { 'image-1': 0, 'image-2': 1 } });
  });
});

describe('compactify function', function() {
  it('should compactify function arguments', function() {
    const compactify = rewire('../compactify.js');
    const compactify_args = compactify.__get__('compactify_args');

    assert.deepEqual(compactify_args({
    }, {
      "locals": {}, "function": {}, "list": {}, "variable": {}, "image": {}
    }), {});

    assert.deepEqual(compactify_args(
      [
        { name: 'function',
          function: 'f1',
          args: [ { variable: 'p' }, { variable: 'q' } ],
          blocks: [
            { name: 'if-then',
              condition: {
                name: 'equal?',
                x: { name: 'variable-ref', variable: 'p' },
                y: 1 },
              blocks: [
                { name: 'plus',
                  x: { name: 'variable-ref', variable: 'p' },
                  y: { name: 'variable-ref', variable: 'q' } }]},
          ] },
        { name: 'function',
          function: 'f2',
          args: [ { variable: 'x' }, { variable: 'y' } ],
          blocks: [
            { name: 'if-then',
              condition: {
                name: 'equal?',
                x: { name: 'variable-ref', variable: 'p' },
                y: 1 },
              blocks: [
                { name: 'plus',
                  x: { name: 'variable-ref', variable: 'p' },
                  y: { name: 'variable-ref', variable: 'q' } }]},
          ] }
      ],
      {
        "locals": {
          "f1": { "p": -1, "q": -2 },
          "f2": { "x": -1, "y": -2 }
        },
        "function": { 'f1': 0, 'f2': 1 },
        "list": {},
        "variable": { 'p': 0, 'q': 1, 'x': 2, 'y': 3 },
        "image": {} }
    ), [
      { name: 'function',
        function: 'f1',
        args: 2,
        blocks: [
          { name: 'if-then',
            condition: {
              name: 'equal?',
              x: { name: 'variable-ref', variable: -1 },
              y: 1 },
            blocks: [
              { name: 'plus',
                x: { name: 'variable-ref', variable: -1 },
                y: { name: 'variable-ref', variable: -2 } }]}]},
      { name: 'function',
        function: 'f2',
        args: 2,
        blocks: [
          { name: 'if-then',
            condition: {
              name: 'equal?',
              x: { name: 'variable-ref', variable: 'p' },
              y: 1 },
            blocks: [
              { name: 'plus',
                x: { name: 'variable-ref', variable: 'p' },
                y: { name: 'variable-ref', variable: 'q' } }]},
        ] }]);
  });

  it('should compactify function with local variables', function() {
    const compactify = rewire('../compactify.js');
    const compactify_args = compactify.__get__('compactify_args');

    assert.deepEqual(compactify_args(
      [
        { name: 'function',
          function: 'f',
          locals: [
            { variable: 'p', value: { name: 'plus', x: 1, y: 2 } },
            { variable: 'q', value: { name: 'minus', x: 1, y: 2 } } ],
          blocks: [
            { name: 'wait',
              secs: {
                name: 'divide',
                x: { name: 'variable-ref', variable: 'q' },
                y: { name: 'variable-ref', variable: 'p' } }},
          ] }],
      { "locals": { "f": { "p": -1, "q": -2 } },
        "function": { 'f': 0 },
        "list": {},
        "image": {},
        "variable": { 'p': 0, 'q': 1, 'x': 2, 'y': 3 } }
    ), [
      { name: 'function',
        function: 'f',
        locals: [
          { variable: -1, value: { name: 'plus', x: 1, y: 2 } },
          { variable: -2, value: { name: 'minus', x: 1, y: 2 } } ],
        blocks: [
          { name: 'wait',
            secs: {
              name: 'divide',
              x: { name: 'variable-ref', variable: -2 },
              y: { name: 'variable-ref', variable: -1 } }},
        ] }]);

    assert.deepEqual(compactify_args(
      [
        { name: 'function',
          function: 'f1',
          locals: [
            { variable: 'p', value: { name: 'plus', x: 1, y: 2 } },
            { variable: 'q', value: { name: 'minus', x: 1, y: 2 } } ],
          blocks: [
            { name: 'wait',
              secs: {
                name: 'divide',
                x: { name: 'variable-ref', variable: 'q' },
                y: { name: 'variable-ref', variable: 'p' } }},
          ] },
        { name: 'function',
          function: 'f2',
          args: [
            { variable: 'q' }
          ],
          locals: [
            { variable: 'p', value: { name: 'plus', x: 1, y: 2 } },
            { variable: 'r', value: {
              name: 'minus',
              x: { name: 'variable-ref', variable: 'q' },
              y: 2 } } ],
          blocks: [
            { name: 'wait',
              secs: {
                name: 'divide',
                x: { name: 'variable-ref', variable: 'r' },
                y: { name: 'variable-ref', variable: 'q' } }},
          ] }],
      {
        "locals": {
          "f1": { "p": -1, "q": -2 },
          "f2": { "q": -1, "p": -2, "r": -3 }
        },
        "function": { 'f1': 0 },
        "list": {},
        "image": {},
        "variable": { 'p': 0, 'q': 1, 'x': 2, 'y': 3 } }
    ), [
      { name: 'function',
        function: 'f1',
        locals: [
          { variable: -1, value: { name: 'plus', x: 1, y: 2 } },
          { variable: -2, value: { name: 'minus', x: 1, y: 2 } } ],
        blocks: [
          { name: 'wait',
            secs: {
              name: 'divide',
              x: { name: 'variable-ref', variable: -2 },
              y: { name: 'variable-ref', variable: -1 } }},
        ] },
      { name: 'function',
        function: 'f2',
        args: 1,
        locals: [
          { variable: -2, value: { name: 'plus', x: 1, y: 2 } },
          { variable: -3, value: {
            name: 'minus',
            x: { name: 'variable-ref', variable: -1 },
            y: 2 } } ],
        blocks: [
          { name: 'wait',
            secs: {
              name: 'divide',
              x: { name: 'variable-ref', variable: -3 },
              y: { name: 'variable-ref', variable: -1 } }},
        ] }]);
  });
});

describe('compactify when-green-flag-clicked', function() {
  it('should compactify when-green-flag-clicked with locals', function() {
    const compactify = rewire('../compactify.js');
    const compactify_args = compactify.__get__('compactify_args');

    assert.deepEqual(compactify_args(
      [
        { name: 'when-green-flag-clicked',
          locals: [
            { variable: 'p', value: { name: 'plus', x: 1, y: 2 } },
            { variable: 'q', value: { name: 'minus', x: 1, y: 2 } } ],
          blocks: [
            { name: 'wait',
              secs: {
                name: 'divide',
                x: { name: 'variable-ref', variable: 'q' },
                y: { name: 'variable-ref', variable: 'p' } }},
          ] }],
      { 'when-green-flag-clicked': { "locals": { "p": -1, "q": -2 } },
        "locals": {},
        "function": {},
        "list": {},
        "variable": { 'p': 0, 'q': 1, 'x': 2, 'y': 3 } }
    ), [
      { name: 'when-green-flag-clicked',
        locals: [
          { variable: -1, value: { name: 'plus', x: 1, y: 2 } },
          { variable: -2, value: { name: 'minus', x: 1, y: 2 } } ],
        blocks: [
          { name: 'wait',
            secs: {
              name: 'divide',
              x: { name: 'variable-ref', variable: -2 },
              y: { name: 'variable-ref', variable: -1 } }},
        ] }]);
  });
});

describe('compactify scripts', function() {
  it('should compactify scripts', function() {
    const compactify = rewire('../compactify.js');
    const compactify_scripts = compactify.__get__('compactify_scripts');
    const compactify_toplevel = compactify.__get__('compactify_toplevel');

    assert.deepEqual(compactify_scripts({
    }, { "locals": {}, "function": {}, "list": {}, "variable": {} }), {});

    assert.deepEqual(compactify_scripts(
      [
        { name: 'function',
          function: 'f1',
          args: [ { variable: 'p' }, { variable: 'q' } ],
          blocks: [
            { name: 'if-then',
              condition: {
                name: 'equal?',
                "python-info": {
                  "visual": false,
                  "lineno": -1,
                  "col_offset": -1
                },
                x: { name: 'variable-ref', variable: 'p' },
                y: 1 },
              "python-info": {
                "visual": false,
                "lineno": -1,
                "col_offset": -1
              },
              blocks: [
                { name: 'plus',
                  "python-info": {
                    "visual": false,
                    "lineno": -1,
                    "col_offset": -1
                  },
                  x: { name: 'variable-ref', variable: 'p' },
                  y: { name: 'variable-ref', variable: 'q' } }]},
          ] },
        { name: 'function',
          function: 'f2',
          args: [ {
            variable: 'x',
            "python-info": {
              "visual": false,
              "lineno": -1,
              "col_offset": -1
            },
          }, {
            variable: 'y',
            "python-info": {
              "visual": false,
              "lineno": -1,
              "col_offset": -1
            },
          } ],
          blocks: [
            { name: 'if-then',
              condition: {
                name: 'equal?',
                "python-info": {
                  "visual": false,
                  "lineno": -1,
                  "col_offset": -1
                },
                x: { name: 'variable-ref', variable: 'p' },
                y: { name: 'call-function',
                     function: 'f1',
                     args: [
                       { variable: 'p',
                         "python-info": {
                           "visual": false,
                           "lineno": -1,
                           "col_offset": -1
                         },
                         value: {
                           name: 'multiply',
                           "python-info": {
                             "visual": false,
                             "lineno": -1,
                             "col_offset": -1
                           },
                           x: { name: 'variable-ref', variable: 'y' },
                           y: { name: 'variable-ref', variable: 'x' } }},
                       { variable: 'q',
                         "python-info": {
                           "visual": false,
                           "lineno": -1,
                           "col_offset": -1
                         },
                         value: {
                           name: 'divide',
                           "python-info": {
                             "visual": false,
                             "lineno": -1,
                             "col_offset": -1
                           },
                           x: { name: 'variable-ref', variable: 'p' },
                           y: { name: 'variable-ref', variable: 'q' } }},
                     ], } },
              blocks: [
                { name: 'plus',
                  "python-info": {
                    "visual": false,
                    "lineno": -1,
                    "col_offset": -1
                  },
                  x: { name: 'variable-ref', variable: 'p' },
                  y: { name: 'variable-ref', variable: 'q' } }]},
          ] }
      ],
      {
        "locals": {
          "f1": { "p": -1, "q": -2 },
          "f2": { "x": -1, "y": -2 }
        },
        "function": { 'f1': 0, 'f2': 1 },
        "list": {},
        "variable": { 'p': 0, 'q': 1, 'x': 2, 'y': 3 } }
    ), [
      { name: 'function',
        function: 0,
        args: 2,
        blocks: [
          { name: 'if-then',
            condition: {
              name: 'equal?',
              x: { name: 'variable-ref', variable: -1 },
              y: 1 },
            blocks: [
              { name: 'plus',
                x: { name: 'variable-ref', variable: -1 },
                y: { name: 'variable-ref', variable: -2 } }]}]},
      { name: 'function',
        function: 1,
        args: 2,
        blocks: [
          { name: 'if-then',
            condition: {
              name: 'equal?',
              x: { name: 'variable-ref', variable: 0 },
              y: { name: 'call-function', function: 0,
                   args: [
                     { variable: -1,
                       value: {
                         name: 'multiply',
                         x: { name: 'variable-ref', variable: -2 },
                         y: { name: 'variable-ref', variable: -1 } }},
                     { variable: -2,
                       value: {
                         name: 'divide',
                         x: { name: 'variable-ref', variable: 0 },
                         y: { name: 'variable-ref', variable: 1 } }},
                   ]} },
            blocks: [
              { name: 'plus',
                x: { name: 'variable-ref', variable: 0 },
                y: { name: 'variable-ref', variable: 1 } }]},
        ] }]);

    assert.deepEqual(compactify_toplevel({
      scripts: [
        { name: 'when-green-flag-clicked',
          blocks: [
            { name: 'wait', secs: {
              name: 'call-function', function: 'f0',
              args: [
                { variable: 'p',
                  value: { name: 'multiply', x: 2, y: 3 }},
                { variable: 'q',
                  value: { name: 'divide', x: 5, y: 2 }}
              ] }},
            { name: 'wait', secs: {
              name: 'call-function', function: 'f1',
              args: [
                { variable: 'y',
                  value: 8},
                { variable: 'x',
                  value: {
                    name: 'call-function', function: 'f0',
                    args: [
                      { variable: 'p',
                        value: { name: 'multiply', x: 3, y: 4 }},
                      { variable: 'q',
                        value: { name: 'divide', x: 5, y: 6 }}
                    ] }}
              ] }},
            { name: 'led-matrix',
              image: 'image-1',
              port: 'V2',
              x: 2,
              y: 0,
              brightness: 0.3
            }
          ]
        },
        { name: 'function', function: 'f0',
          args: [ { variable: 'p' }, { variable: 'q' } ],
          blocks: [ { name: 'plus', x: 1, y: 2 } ] },
        { name: 'function', function: 'f1',
          args: [ { variable: 'x' }, { variable: 'y' } ],
          blocks: [ { name: 'minus', x: 1, y: 2 } ] },
        { name: 'image',
          image: 'image-1',
          width: 3,
          height: 5,
          format: 'grb',
          pixels: [
            100, 0, 0
          ] },
      ]}), {
        "port-parameters": {},
        "port-settings": {},
        "scripts": [
          {
            "blocks": [
              {
                "name": "wait",
                "secs": {
                  "args": [
                    {
                      "value": {
                        "name": "multiply",
                        "x": 2,
                        "y": 3,
                      },
                      "variable": -1
                    },
                    {
                      "value": {
                        "name": "divide",
                        "x": 5,
                        "y": 2,
                      },
                      "variable": -2
                    }
                  ],
                  "function": 0,
                  "name": "call-function"
                }
              },
              {
                "name": "wait",
                "secs": {
                  "args": [
                    {
                      "value": 8,
                      "variable": -2
                    },
                    {
                      "value": {
                        "args": [
                          {
                            "value": {
                              "name": "multiply",
                              "x": 3,
                              "y": 4
                            },
                            "variable": -1
                          },
                          {
                            "value": {
                              "name": "divide",
                              "x": 5,
                              "y": 6
                            },
                            "variable": -2
                          }
                        ],
                        "function": 0,
                        "name": "call-function"
                      },
                      "variable": -1
                    }
                  ],
                  "function": 1,
                  "name": "call-function"
                }
              },
              { name: 'led-matrix',
                image: 0,
                port: 'V2',
                x: 2,
                y: 0,
                brightness: 0.3
              }
            ],
            "name": "when-green-flag-clicked"
          },
          {
            "args": 2,
            "blocks": [
              {
                "name": "plus",
                "x": 1,
                "y": 2
              }
            ],
            "function": 0,
            "name": "function"
          },
          {
            "args": 2,
            "blocks": [
              {
                "name": "minus",
                "x": 1,
                "y": 2
              }
            ],
            "function": 1,
            "name": "function"
          },
          { name: 'image',
            image: 0,
            width: 3,
            height: 5,
            format: 'grb',
            pixels: [
              100, 0, 0
            ] }
        ]
      });

    assert.deepEqual(compactify_toplevel({
      "port-settings": {
        "A0": "push-button",
        "A1": "push-button",
        "A2": "push-button",
        "A3": "push-button",
        "V0": "dc-motor",
        "V1": "dc-motor",
        "V2": "led",
        "V3": "led",
        "V4": "led",
        "V6": "buzzer",
        "V7": "servo-motor",
        "V8": "servo-motor",
        "python-info": {},
      },
      "port-parameters": {
        "python-info": {},
        "V0": { "dc-motor": { "scale": 0.8, "python-info": {} } },
        "V1": { "dc-motor": { "scale": 0 }, "python-info": {} },
        "V6": { "servo-motor": { "degree": 180, "python-info": {} } },
        "V7": { "servo-motor": { "drift": 10 }, "python-info": {} },
        "V8": { "servo-motor": { "degree": 0, "drift": -10 } }
      },
    }), {
      "port-settings": {
        "A0": "push-button",
        "A1": "push-button",
        "A2": "push-button",
        "A3": "push-button",
        "V0": "dc-motor",
        "V1": "dc-motor",
        "V2": "led",
        "V3": "led",
        "V4": "led",
        "V6": "buzzer",
        "V7": "servo-motor",
        "V8": "servo-motor"
      },
      "port-parameters": {
        "V0": { "dc-motor": { "scale": 0.8 } },
        "V1": { "dc-motor": { "scale": 0 } },
        "V6": { "servo-motor": { "degree": 180 } },
        "V7": { "servo-motor": { "drift": 10 } },
        "V8": { "servo-motor": { "degree": 0, "drift": -10 } }
      },
    });
  });
});
