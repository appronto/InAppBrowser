/*global logger*/
/*
    InAppBrowser
    ========================

    @file      : InAppBrowser.js
    @version   : 1.0.0
    @author    : JvdGraaf
    @date      : Thu, 19 Dec 2019 10:26:59 GMT
    @copyright : Appronto B.V.
    @license   : ApacheV2

    Documentation
    ========================
    Describe your widget here.
*/

// Required module list. Remove unnecessary modules, you can always get them back from the boilerplate.
define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",
    "dijit/_TemplatedMixin",

    "mxui/dom",
    "dojo/dom",
    "dojo/dom-prop",
    "dojo/dom-geometry",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/text",
    "dojo/html",
    "dojo/_base/event",

    "InAppBrowser/lib/jquery-1.11.2",
    "dojo/text!InAppBrowser/widget/template/InAppBrowser.html"
], function (declare, _WidgetBase, _TemplatedMixin, dom, dojoDom, dojoProp, dojoGeometry, dojoClass, dojoStyle, dojoConstruct, dojoArray, lang, dojoText, dojoHtml, dojoEvent, _jQuery, widgetTemplate) {
    "use strict";

    var $ = _jQuery.noConflict(true);

    // Declare widget's prototype.
    return declare("InAppBrowser.widget.InAppBrowser", [ _WidgetBase, _TemplatedMixin ], {
        // _TemplatedMixin will create our dom node using this HTML template.
        templateString: widgetTemplate,

        // DOM elements
        appButton: null,

        // Parameters configured in the Modeler.
        urllink: "",
        buttonText: "",

        // Internal variables. Non-primitives created in the prototype are shared between all widget instances.
        _handles: null,
        _contextObj: null,
        _readOnly: false,

        // dojo.declare.constructor is called to construct the widget instance. Implement to initialize non-primitive properties.
        constructor: function () {
//            logger.debug(this.id + ".constructor");
            this._handles = [];
            
        },

        // dijit._WidgetBase.postCreate is called after constructing the widget. Implement to do extra setup work.
        postCreate: function () {
            logger.debug(this.id + ".postCreate");

            if (this.readOnly || this.get("disabled") || this.readonly) {
              this._readOnly = true;
            }
            
            
            
            this._updateRendering();
            this._setupEvents();
        },

        // mxui.widget._WidgetBase.update is called when context is changed or initialized. Implement to re-render and / or fetch data.
        update: function (obj, callback) {
            logger.debug(this.id + ".update");

            this._contextObj = obj;
            this._resetSubscriptions();
            this._updateRendering(callback); // We're passing the callback to updateRendering to be called after DOM-manipulation
        },

        // mxui.widget._WidgetBase.enable is called when the widget should enable editing. Implement to enable editing if widget is input widget.
        enable: function () {
//          logger.debug(this.id + ".enable");
        },

        // mxui.widget._WidgetBase.enable is called when the widget should disable editing. Implement to disable editing if widget is input widget.
        disable: function () {
//          logger.debug(this.id + ".disable");
        },

        // mxui.widget._WidgetBase.resize is called when the page's layout is recalculated. Implement to do sizing calculations. Prefer using CSS instead.
        resize: function (box) {
//          logger.debug(this.id + ".resize");
        },

        // mxui.widget._WidgetBase.uninitialize is called when the widget is destroyed. Implement to do special tear-down work.
        uninitialize: function () {
//          logger.debug(this.id + ".uninitialize");
            // Clean up listeners, helper objects, etc. There is no need to remove listeners added with this.connect / this.subscribe / this.own.
        },

        // We want to stop events on a mobile device
        _stopBubblingEventOnMobile: function (e) {
            logger.debug(this.id + "._stopBubblingEventOnMobile");
            if (typeof document.ontouchstart !== "undefined") {
                dojoEvent.stop(e);
            }
        },

        // Attach events to HTML dom elements
        _setupEvents: function () {
            $(this.appButton).on('click touch', lang.hitch(this, this._openBrowser));
        },
        
        _openBrowser: function () {
            if(this._contextObj) {
                var link = this._contextObj.get(this.urllink);
                
                if(typeof cordova !== "undefined"){
                    // Render mobile version
                    var settings = "";
                    if(this.closeText){
                        settings = this._append(settings, "closebuttoncaption", this.closeText);
                    }
                    settings = this._append(settings, "location", !this.hideURLBar); //iOS
                    settings = this._append(settings, "hideurlbar", this.hideURLBar); // Android
                    settings = this._append(settings, "hidenavigationbuttons", this.hideNavBtn);
                    settings = this._append(settings, "enableViewportScale", !this.disallowScroll); //iOS
                    settings = this._append(settings, "disallowoverscroll", this.disallowScroll); // Android
                    console.log(this.id + "._openBrowser: " + link + " with settings: " + settings);

                    var samlWindow = cordova.InAppBrowser.open(link, "_blank",settings);
                    samlWindow.addEventListener("loaderror", lang.hitch(this, function (params) {
                        console.log("Error on loading page: " + JSON.stringify(params));
                    }));
                } else {
                    // Render responsive version
                    console.log(this.id + "._openBrowser handle responsive");
                }
                
            } else {
                console.log(this.id + "._openBrowser context object is missing!");
            }
        },
        
        _append: function(settings, key, value){
            if(settings.length > 0)
                settings += ",";
            settings += key + "=";
            
            if(typeof value === 'boolean' ){
                if(value)
                    settings += "yes";
                else
                    settings += "no";
            } else {
                settings += value;
            }
            
            return settings;  
        },

        _execMf: function (mf, guid, cb) {
//            logger.debug(this.id + "._execMf");
            if (mf && guid) {
                mx.ui.action(mf, {
                    params: {
                        applyto: "selection",
                        guids: [guid]
                    },
                    callback: lang.hitch(this, function (objs) {
                        if (cb && typeof cb === "function") {
                            cb(objs);
                        }
                    }),
                    error: function (error) {
                        console.debug(error.description);
                    }
                }, this);
            }
        },

        // Rerender the interface.
        _updateRendering: function (callback) {
            logger.debug(this.id + "._updateRendering");
            
            
            if(!this.appButton){
                // Create button/link
                
                if(this.buttonRender == "link"){
                    // <span role="button" class="mx-link"><span class="glyphicon glyphicon-chevron-right"></span><a>Link</a></span>
                    this.appButton = $("<span></span>", {"class" : "mx-link", role : "button"});
                    $(this.appButton).append($("<a></a>", {text: this.buttonText}));
                } else {
                    // <button type="button" class="btn mx-button btn-default" data-dojo-attach-point="appButton"><span class="glyphicon glyphicon-chevron-right"></span>Open</button>
                    this.appButton = $("<button></button>", {"class" : "btn mx-button btn-default", text: this.buttonText});
                }
                if(this.buttonIcon){
                    $(this.appButton).prepend(" ").prepend($("<span></span>",  {"class" : this.buttonIcon}));
                }
                $(this.domNode).append(this.appButton);
                
            }

            // The callback, coming from update, needs to be executed, to let the page know it finished rendering
            this._executeCallback(callback, "_updateRendering");
        },

        // Reset subscriptions.
        _resetSubscriptions: function () {
//            logger.debug(this.id + "._resetSubscriptions");
            // Release handles on previous object, if any.
            this.unsubscribeAll();

            // When a mendix object exists create subscribtions.
            if (this._contextObj) {
                this.subscribe({
                    guid: this._contextObj.getGuid(),
                    callback: lang.hitch(this, function (guid) {
                        this._updateRendering();
                    })
                });

//                this.subscribe({
//                    guid: this._contextObj.getGuid(),
//                    attr: this.backgroundColor,
//                    callback: lang.hitch(this, function (guid, attr, attrValue) {
//                        this._updateRendering();
//                    })
//                });
            }
        },

        _executeCallback: function (cb, from) {
            logger.debug(this.id + "._executeCallback" + (from ? " from " + from : ""));
            if (cb && typeof cb === "function") {
                cb();
            }
        }
    });
});

require(["InAppBrowser/widget/InAppBrowser"]);
