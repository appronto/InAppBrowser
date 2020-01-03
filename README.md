# Mendix InAppBrowser
Mendix mobile hybrid apps are usable for only 1 Mendix application. But what if you want setup a microservice architecture and display all your Mendix apps through 1 mobile app? An option is the usage of the Cordova InAppBrowser plugin.  
This widget is a simple setup on using the InAppBrowser plugin of Cordova and loading pages wihout navigating away of youw app.
### Typical usage scenario
Displaying you Mendix microservice architecture in just 1 hybrid app.
### Features and limitations
* Open an URL on an attribute.
* Configuring the InAppBrowser settings like navigation buttons or URL bar.
* Offline capability
### Dependencies [optional]
* Mendix 7.23.2 or higher
### Configuration
Add the widget inside a Dataview and configure the String Attribute containing the complete URL. Make sure that the link contains the required navigation profile for Mendix.