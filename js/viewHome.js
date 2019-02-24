 /*
  * viewHome.js
  *
  * Sweet Home 3D, Copyright (c) 2016 Emmanuel PUYBARET / eTeks <info@eteks.com>
  *
  * This program is free software; you can redistribute it and/or modify
  * it under the terms of the GNU General Public License as published by
  * the Free Software Foundation; either version 2 of the License, or
  * (at your option) any later version.
  *
  * This program is distributed in the hope that it will be useful,
  * but WITHOUT ANY WARRANTY; without even the implied warranty of
  * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  * GNU General Public License for more details.
  *
  * You should have received a copy of the GNU General Public License
  * along with this program; if not, write to the Free Software
  * Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
  */
 
 /**
  * Loads the home from the given URL and displays it in the 3D canvas with <code>canvasId</code>.
  * <code>params.navigationPanel</code> may be equal to <code>"none"</code>, <code>"default"</code> 
  * or an HTML string which content will replace the default navigation panel. 
  * @param {string} canvasId  the value of the id attribute of the 3D canvas 
  * @param {string} homeUrl the URL of the home to load and display
  * @param onError  callback called in case of error with an exception as parameter 
  * @param onprogression callback with (part, info, percentage) parameters called during the download of the home 
  *                      and the 3D models it displays.
  * @param {{roundsPerMinute: number, 
  *          navigationPanel: string,
  *          aerialViewButtonId: string, 
  *          virtualVisitButtonId: string, 
  *          levelsAndCamerasListId: string,
  *          level: string,
  *          selectableLevels: string[],
  *          camera: string,
  *          selectableCameras: string[],
  *          activateCameraSwitchKey: boolean}} [params] the ids of the buttons and other information displayed in the user interface. 
  *                      If not provided, controls won't be managed if any, no animation and navigation arrows won't be displayed. 
  * @return {HomePreviewComponent} the returned object gives access to the loaded {@link Home} instance, 
  *                the {@link HomeComponent3D} instance that displays it, the {@link HomeController3D} instance that manages 
  *                camera changes and the {@link UserPreferences} in use.             
  */
 function viewHome(canvasId, homeUrl, onerror, onprogression, params) {
   return new HomePreviewComponent(canvasId, homeUrl, onerror, onprogression, params);
 }
 
 /**
  * Loads the home from the given URL and displays it in an overlay. 
  * Canvas size ratio is 4 / 3 by default. 
  * <code>params.navigationPanel</code> may be equal to <code>"none"</code>, <code>"default"</code> 
  * or an HTML string which content will replace the default navigation panel. 
  * If needed, the id of the created canvas is <code>viewerCanvas</code> and its <code>homePreviewComponent</code> 
  * property returns the instance of {@link HomePreviewComponent} associated to it.
  * @param {string} homeUrl the URL of the home to display
  * @param {{roundsPerMinute: number, 
  *          widthByHeightRatio: number,
  *          navigationPanel: string,
  *          aerialViewButtonText: string, 
  *          virtualVisitButtonText: string, 
  *          level: string,
  *          selectableLevels: string[],
  *          camera: string,
  *          selectableCameras: string[],
  *          activateCameraSwitchKey: boolean, 
  *          viewerControlsAdditionalHTML: string,
  *          readingHomeText: string, 
  *          readingModelText: string,
  *          noWebGLSupportError: string,
  *          missingHomeXmlEntryError: string}} [params] the texts and other information displayed in the user interface. 
  *                      If not provided, there will be no controls, no animation and canvas size ratio will be 4/3 
  *                      with no navigation panel. 
  */
 function viewHomeInOverlay(homeUrl, params) {
   var widthByHeightRatio = 4 / 3;
   if (params && params.widthByHeightRatio) {
     widthByHeightRatio = params.widthByHeightRatio;
   }
   
   // Ensure no two overlays are displayed
   hideHomeOverlay();
   
   var overlayDiv = document.createElement("div");
   overlayDiv.setAttribute("id", "viewerOverlay");
   overlayDiv.style.position = "absolute";
   overlayDiv.style.left = "0";
   overlayDiv.style.top = "0";
   overlayDiv.style.zIndex = "100";
   overlayDiv.style.background = "rgba(127, 127, 127, .5)";
     
   var bodyElement = document.getElementsByTagName("body").item(0);
   bodyElement.insertBefore(overlayDiv, bodyElement.firstChild);
 
   var homeViewDiv = document.createElement("div");
   var divHTML =
         '<canvas id="viewerCanvas" class="viewerComponent"  style="background-color: #CCCCCC; border: 1px solid gray; position: absolute; outline: none; touch-action: none" tabIndex="1"></canvas>'
       + '<div id="viewerProgressDiv" style="position:absolute; width: 300px; background-color: rgba(128, 128, 128, 0.7); padding: 20px; border-radius: 25px">'
       + '  <progress id="viewerProgress"  class="viewerComponent" value="0" max="200" style="width: 300px;"></progress>'
       + '  <label id="viewerProgressLabel" class="viewerComponent" style="margin-top: 2px; margin-left: 10px; margin-right: 0px; display: block;"></label>'
       + '</div>';
   if (params 
       && (params.aerialViewButtonText && params.virtualVisitButtonText 
           || params.viewerControlsAdditionalHTML)) {
     divHTML += '<div id="viewerControls" style="position: absolute; padding: 10px; padding-top: 5px">';
     if (params.aerialViewButtonText && params.virtualVisitButtonText) {
       divHTML += 
             '   <input  id="aerialView" class="viewerComponent" name="cameraType" type="radio" style="visibility: hidden;"/>'
           + '      <label class="viewerComponent" for="aerialView" style="visibility: hidden;">' + params.aerialViewButtonText + '</label>'
           + '   <input  id="virtualVisit" class="viewerComponent" name="cameraType" type="radio" style="visibility: hidden;">'
           + '      <label class="viewerComponent" for="virtualVisit" style="visibility: hidden;">' + params.virtualVisitButtonText + '</label>'
           + '   <select id="levelsAndCameras" class="viewerComponent" style="visibility: hidden;"></select>';
     }
     if (params.viewerControlsAdditionalHTML) {
       divHTML += params.viewerControlsAdditionalHTML;
     }
     divHTML += '</div>';  
   }
   homeViewDiv.innerHTML = divHTML;
   overlayDiv.appendChild(homeViewDiv);
 
   // Create close button image
   var closeButtonImage = new Image();
   closeButtonImage.src = ZIPTools.getScriptFolder("jszip.min.js") + "/close.png";
   closeButtonImage.style.position = "absolute";
   overlayDiv.appendChild(closeButtonImage);
   
   overlayDiv.escKeyListener = function(ev) {
       if (ev.keyCode === 27) {
         hideHomeOverlay();
       }
     };
   window.addEventListener("keydown", overlayDiv.escKeyListener);
   closeButtonImage.addEventListener("click", hideHomeOverlay);
   var mouseActionsListener = {
       mousePressed : function(ev) {
         mouseActionsListener.mousePressedInOverlay = true;
       },
       mouseClicked : function(ev) {
         if (mouseActionsListener.mousePressedInOverlay) {
           delete mouseActionsListener.mousePressedInOverlay;
           hideHomeOverlay();
         }
       }
     };
   overlayDiv.addEventListener("mousedown", mouseActionsListener.mousePressed); 
   overlayDiv.addEventListener("click", mouseActionsListener.mouseClicked); 
   overlayDiv.addEventListener("touchmove", 
       function(ev) {
         ev.preventDefault();
       });
   
   // Place canvas in the middle of the window
   var windowWidth  = self.innerWidth;
   var windowHeight = self.innerHeight;
   var pageWidth = document.documentElement.clientWidth;
   var pageHeight = document.documentElement.clientHeight;
   if (bodyElement && bodyElement.scrollWidth) {
     if (bodyElement.scrollWidth > pageWidth) {
       pageWidth = bodyElement.scrollWidth;
     }
     if (bodyElement.scrollHeight > pageHeight) {
       pageHeight = bodyElement.scrollHeight;
     }
   }
   var pageXOffset = self.pageXOffset ? self.pageXOffset : 0;
   var pageYOffset = self.pageYOffset ? self.pageYOffset : 0;
   
   overlayDiv.style.height = Math.max(pageHeight, windowHeight) + "px";
   overlayDiv.style.width = pageWidth <= windowWidth
       ? "100%"
       : pageWidth + "px";
   overlayDiv.style.display = "block";
 
   var canvas = document.getElementById("viewerCanvas");
   if (windowWidth < windowHeight * widthByHeightRatio) {
     canvas.width = 0.9 * windowWidth;
     canvas.height = 0.9 * windowWidth / widthByHeightRatio;
   } else {
     canvas.height = 0.9 * windowHeight;
     canvas.width = 0.9 * windowHeight * widthByHeightRatio;
   }
   canvas.style.width = canvas.width + "px";
   canvas.style.height = canvas.height + "px";
   var canvasLeft = pageXOffset + (windowWidth - canvas.width - 10) / 2;
   canvas.style.left = canvasLeft + "px";
   var canvasTop = pageYOffset + (windowHeight - canvas.height - 10) / 2;
   canvas.style.top = canvasTop + "px";
       
   // Place close button at top right of the canvas
   closeButtonImage.style.left = (canvasLeft + canvas.width - 5) + "px";
   closeButtonImage.style.top = (canvasTop - 10) + "px";
   
   // Place controls below the canvas
   var controlsDiv = document.getElementById("viewerControls");
   if (controlsDiv) {
     controlsDiv.style.left = (canvasLeft - 10) + "px";
     controlsDiv.style.top = (canvasTop + canvas.height) + "px";
     controlsDiv.addEventListener("mousedown", 
         function(ev) {
           // Ignore in overlay mouse clicks on controls
           ev.stopPropagation();
         });
   }
   
   // Place progress in the middle of the canvas
   var progressDiv = document.getElementById("viewerProgressDiv");
   progressDiv.style.left = (canvasLeft + (canvas.width - 300) / 2) + "px";
   progressDiv.style.top = (canvasTop + (canvas.height - 50) / 2) + "px";
   progressDiv.style.visibility = "visible";
   
   var onerror = function(err) {
       hideHomeOverlay();
       if (err == "No WebGL") {
         var errorMessage = "Sorry, your browser doesn't support WebGL.";
         if (params.noWebGLSupportError) {
           errorMessage = params.noWebGLSupportError;
         }
         alert(errorMessage);
       } else if (typeof err === "string" && err.indexOf("No Home.xml entry") == 0) {
         var errorMessage = "Ensure your home file was saved with Sweet Home 3D 5.3 or a newer version.";
         if (params.missingHomeXmlEntryError) {
           errorMessage = params.missingHomeXmlEntryError;
         }
         alert(errorMessage);        
       } else {
         console.log(err.stack);
         alert("Error: " + (err.message  ? err.constructor.name + " " +  err.message  : err));
       }
     };
   var onprogression = function(part, info, percentage) {
       var progress = document.getElementById("viewerProgress");
       if (progress) {
         var text = null;
         if (part === HomeRecorder.READING_HOME) {
           progress.value = percentage * 100;
           info = info.substring(info.lastIndexOf('/') + 1);
           text = params && params.readingHomeText
               ? params.readingHomeText : part;
         } else if (part === ModelLoader.READING_MODEL) {
           progress.value = 100 + percentage * 100;
           if (percentage === 1) {
             document.getElementById("viewerProgressDiv").style.visibility = "hidden";
           }
           text = params && params.readingModelText
               ? params.readingModelText : part;
         }
         
         if (text !== null) {
           document.getElementById("viewerProgressLabel").innerHTML = 
               (percentage ? Math.floor(percentage * 100) + "% " : "") + text + " " + info;
         }
       }
     };
  
   // Display home in canvas 3D
   var homePreviewComponentContructor = HomePreviewComponent;
   if (params) {
     if (params.homePreviewComponentContructor) {
       homePreviewComponentContructor = params.homePreviewComponentContructor;
     }
     if (params.aerialViewButtonText && params.virtualVisitButtonText) {
       canvas.homePreviewComponent = new homePreviewComponentContructor(
           "viewerCanvas", homeUrl, onerror, onprogression, 
           {roundsPerMinute : params.roundsPerMinute, 
            navigationPanel : params.navigationPanel,
            aerialViewButtonId : "aerialView", 
            virtualVisitButtonId : "virtualVisit", 
            levelsAndCamerasListId : "levelsAndCameras",
            level : params.level,
            selectableLevels : params.selectableLevels,
            camera: params.camera,
            selectableCameras : params.selectableCameras,
            activateCameraSwitchKey : params.activateCameraSwitchKey});
     } else {
       canvas.homePreviewComponent = new homePreviewComponentContructor(
           "viewerCanvas", homeUrl, onerror, onprogression, 
           {roundsPerMinute : params.roundsPerMinute,
            navigationPanel : params.navigationPanel});
     }
   } else {
     canvas.homePreviewComponent = new homePreviewComponentContructor("viewerCanvas", homeUrl, onerror, onprogression);
   }
 }
 
 /**
  * Hides the overlay and disposes resources.
  * @private
  */
 function hideHomeOverlay() {
   var overlayDiv = document.getElementById("viewerOverlay");
   if (overlayDiv) {
     // Free caches and remove listeners bound to global objects 
     var canvas = document.getElementById("viewerCanvas");
     if (canvas.homePreviewComponent) {
       canvas.homePreviewComponent.dispose();
     }
     ModelManager.getInstance().clear();
     TextureManager.getInstance().clear();
     ZIPTools.clear();
     window.removeEventListener("keydown", overlayDiv.escKeyListener);
     document.getElementsByTagName("body").item(0).removeChild(overlayDiv);
   }
 }
 
 
 /**
  * Creates a component that loads and displays a home in a 3D canvas.
  * @param {string} canvasId  the value of the id attribute of the 3D canvas 
  * @param {string} homeUrl   the URL of the home to load and display
  * @param onError  callback called in case of error with an exception as parameter 
  * @param onprogression callback with (part, info, percentage) parameters called during the download of the home 
  *                      and the 3D models it displays.
  * @param {{roundsPerMinute: number, 
  *          navigationPanel: string,
  *          aerialViewButtonId: string, 
  *          virtualVisitButtonId: string, 
  *          levelsAndCamerasListId: string,
  *          level: string,
  *          selectableLevels: string[],
  *          camera: string,
  *          selectableCameras: string[],
  *          activateCameraSwitchKey: boolean}} [params] the ids of the buttons and other information displayed in the user interface. 
  *                      If not provided, controls won't be managed if any, no animation and navigation arrows won't be displayed. 
  * @constructor
  * @author Emmanuel Puybaret
  */
 function HomePreviewComponent(canvasId, homeUrl, onerror, onprogression, params) {
   if (document.getElementById(canvasId)) {
     var previewComponent = this;
     this.createHomeRecorder().readHome(homeUrl,
         {
           homeLoaded : function(home) {
             try {
               var canvas = document.getElementById(canvasId);
               if (canvas) {
                 if (params  
                     && params.navigationPanel != "none"  
                     && params.navigationPanel != "default") {
                   // Create class with a getLocalizedString() method that returns the navigationPanel in parameter
                   function UserPreferencesWithNavigationPanel(navigationPanel) {
                     DefaultUserPreferences.call(this);
                     this.navigationPanel = navigationPanel;
                   }
                   UserPreferencesWithNavigationPanel.prototype = Object.create(DefaultUserPreferences.prototype);
                   UserPreferencesWithNavigationPanel.prototype.constructor = UserPreferencesWithNavigationPanel;
 
                   UserPreferencesWithNavigationPanel.prototype.getLocalizedString = function(resourceClass, resourceKey, resourceParameters) {
                     // Return navigationPanel in parameter for the navigationPanel.innerHTML resource requested by HomeComponent3D
                     if (resourceClass === HomeComponent3D && resourceKey == "navigationPanel.innerHTML") {
                       return this.navigationPanel;
                     } else {
                       return UserPreferences.prototype.getLocalizedString.call(this, resourceClass, resourceKey, resourceParameters);
                     }
                   }
                   previewComponent.preferences = new UserPreferencesWithNavigationPanel(params.navigationPanel);
                 } else {
                   previewComponent.preferences = new DefaultUserPreferences();
                 }
                 previewComponent.home = home;
                 previewComponent.controller = new HomeController3D(home, previewComponent.preferences);
                 // Create component 3D with loaded home
                 previewComponent.component3D = previewComponent.createComponent3D(
                     canvasId, home, previewComponent.preferences, previewComponent.controller);
                 previewComponent.prepareComponent(canvasId, onprogression,
                     params ? {roundsPerMinute : params.roundsPerMinute, 
                               navigationPanelVisible : params.navigationPanel && params.navigationPanel != "none",
                               aerialViewButtonId : params.aerialViewButtonId, 
                               virtualVisitButtonId : params.virtualVisitButtonId, 
                               levelsAndCamerasListId : params.levelsAndCamerasListId,
                               level : params.level,
                               selectableLevels : params.selectableLevels,
                               camera : params.camera,
                               selectableCameras : params.selectableCameras,
                               activateCameraSwitchKey : params.activateCameraSwitchKey}
                            : undefined);
               }
             } catch (ex) {
               onerror(ex);
             }
           },
           homeError : function(err) {
             onerror(err);
           },
           progression : onprogression
         });
   } else {
     onerror("No canvas with id equal to " + canvasId);
   }
 }
 
 /**
  * Returns the recorder that will load the home from the given URL.
  * @return {HomeRecorder}
  * @protected
  * @ignore
  */
 HomePreviewComponent.prototype.createHomeRecorder = function() { 
   return new HomeRecorder();
 }
 
 /**
  * Returns the component 3D that will display the given home.
  * @param {string} canvasId  the value of the id attribute of the 3D canvas  
  * @return {HomeComponent3D}
  * @protected
  * @ignore
  */
 HomePreviewComponent.prototype.createComponent3D = function(canvasId) { 
   return new HomeComponent3D(canvasId, this.getHome(), this.getUserPreferences(), null, this.getController());
 }
 
 /**
  * Prepares this component and its user interface.
  * @param {string} canvasId  the value of the id attribute of the 3D canvas 
  * @param onprogression callback with (part, info, percentage) parameters called during the download of the home 
  *                      and the 3D models it displays.
  * @param {{roundsPerMinute: number, 
  *          navigationPanelVisible: boolean,
  *          aerialViewButtonId: string, 
  *          virtualVisitButtonId: string, 
  *          levelsAndCamerasListId: string,
  *          level: string,
  *          selectableLevels: string[],
  *          camera: string,
  *          selectableCameras: string[],
  *          activateCameraSwitchKey: boolean}} [params] the ids of the buttons and other information displayed in the user interface. 
  *                      If not provided, controls won't be managed if any, no animation and navigation panel won't be displayed. 
  * @protected
  * @ignore
  */
 HomePreviewComponent.prototype.prepareComponent = function(canvasId, onprogression, params) { 
   var roundsPerMinute = params && params.roundsPerMinute ? params.roundsPerMinute : 0;
   this.startRotationAnimationAfterLoading = roundsPerMinute != 0;
   if (params && typeof params.navigationPanelVisible) {
     this.getUserPreferences().setNavigationPanelVisible(params.navigationPanelVisible);
   }
   var home = this.getHome();
   if (home.structure) {
     // Make always all levels visible if walls and rooms structure can be modified
     home.getEnvironment().setAllLevelsVisible(true);
   } else {
     // Make all levels always visible when observer camera is used
     var setAllLevelsVisibleWhenObserverCamera = function() {
         home.getEnvironment().setAllLevelsVisible(home.getCamera() instanceof ObserverCamera);
       };
     setAllLevelsVisibleWhenObserverCamera();
     home.addPropertyChangeListener(Home.CAMERA, setAllLevelsVisibleWhenObserverCamera);
   }
   home.getEnvironment().setObserverCameraElevationAdjusted(true);
   
   this.trackFurnitureModels(onprogression, roundsPerMinute);
   
   // Configure camera type buttons and shortcut
   var previewComponent = this;
   var cameraTypeButtonsUpdater = function() {
       previewComponent.stopRotationAnimation();
       if (params && params.aerialViewButtonId && params.virtualVisitButtonId) {
         if (home.getCamera() === home.getTopCamera()) {
           document.getElementById(params.aerialViewButtonId).checked = true;
         } else {
           document.getElementById(params.virtualVisitButtonId).checked = true;
         }
       }
     };
   var toggleCamera = function() {
       previewComponent.startRotationAnimationAfterLoading = false;
       home.setCamera(home.getCamera() === home.getTopCamera() 
           ? home.getObserverCamera() 
           : home.getTopCamera());
       cameraTypeButtonsUpdater();
     };
   var canvas = document.getElementById(canvasId);
   if (params === undefined 
       || params.activateCameraSwitchKey === undefined
       || params.activateCameraSwitchKey) {
     canvas.addEventListener("keydown", 
           function(ev) {
         if (ev.keyCode === 32) { // Space bar
           toggleCamera();
         }
       });
   }
   if (params && params.aerialViewButtonId && params.virtualVisitButtonId) {
     var aerialViewButton = document.getElementById(params.aerialViewButtonId);
     aerialViewButton.addEventListener("change", 
         function() {
           previewComponent.startRotationAnimationAfterLoading = false;
           home.setCamera(aerialViewButton.checked 
               ? home.getTopCamera() 
               : home.getObserverCamera());
         });
     var virtualVisitButton = document.getElementById(params.virtualVisitButtonId);
     virtualVisitButton.addEventListener("change", 
         function() {
           previewComponent.startRotationAnimationAfterLoading = false;
           home.setCamera(virtualVisitButton.checked 
               ? home.getObserverCamera() 
               : home.getTopCamera());
         });
     cameraTypeButtonsUpdater();
     // Make radio buttons and their label visible
     aerialViewButton.style.visibility = "visible";
     virtualVisitButton.style.visibility = "visible";
     var makeLabelVisible = function(buttonId) {
         var labels = document.getElementsByTagName("label");
         for (var i = 0; i < labels.length; i++) {
           if (labels [i].getAttribute("for") == buttonId) {
             labels [i].style.visibility = "visible";
           }
         }
       }
     makeLabelVisible(params.aerialViewButtonId);
     makeLabelVisible(params.virtualVisitButtonId);
     home.addPropertyChangeListener("CAMERA", 
         function() {
           cameraTypeButtonsUpdater();
           if (home.structure && params && params.levelsAndCamerasListId) {
             document.getElementById(params.levelsAndCamerasListId).disabled = home.getCamera() === home.getTopCamera();
           }
         });
   } 
 
   if (params && params.level) {
     var levels = home.getLevels();
     if (levels.length > 0) {
       for (var i = 0; i < levels.length; i++) {
         var level = levels [i];
         if (level.isViewable()
             && level.getName() == params.level) {
           home.setSelectedLevel(level);
           break;
         }
       }
     }
   }
   
   if (params && params.camera) {
     var cameras = home.getStoredCameras();
     if (cameras.length > 0) {
       for (var i = 0; i < cameras.length; i++) {
         var camera = cameras [i];
         if (camera.getName() == params.camera) {
           this.getController().goToCamera(camera);
           break;
         }
       }
     }
   }
   
   if (params && params.levelsAndCamerasListId) {
     var levelsAndCamerasList = document.getElementById(params.levelsAndCamerasListId);
     levelsAndCamerasList.disabled = home.structure !== undefined && home.getCamera() === home.getTopCamera();
     var levels = home.getLevels();
     if (levels.length > 0) {
       for (var i = 0; i < levels.length; i++) {
         var level = levels [i];
         if (level.isViewable()
             && (!params.selectableLevels 
                 || params.selectableLevels.indexOf(level.getName()) >= 0)) {
           var option = document.createElement("option");
           option.text  = level.getName();
           option.level = level;
           levelsAndCamerasList.add(option);
           if (level === home.getSelectedLevel()) {
             levelsAndCamerasList.selectedIndex = levelsAndCamerasList.options.length - 1;
           }
         }
       }
       
       if (params.selectableCameras !== undefined) {
         var cameras = home.getStoredCameras();
         if (cameras.length > 0) {
           var addSeparator = levelsAndCamerasList.options.length > 0;
           for (var i = 0; i < cameras.length; i++) {
             var camera = cameras [i];
             if (params.selectableCameras.indexOf(camera.getName()) >= 0) {
               if (addSeparator) {
                 levelsAndCamerasList.add(document.createElement("option"));
                 addSeparator = false;
               }
               var option = document.createElement("option");
               option.text  = camera.getName();
               option.camera = camera;
               levelsAndCamerasList.add(option);
             }
           }
         }
       }
         
       if (levelsAndCamerasList.options.length > 1) {
         var controller = this.getController();
         levelsAndCamerasList.addEventListener("change", 
             function() {
               previewComponent.startRotationAnimationAfterLoading = false;
               var selectedOption = levelsAndCamerasList.options [levelsAndCamerasList.selectedIndex];
               if (selectedOption.level !== undefined) {
                 home.setSelectedLevel(selectedOption.level);
               } else if (selectedOption.camera !== undefined) {
                 controller.goToCamera(selectedOption.camera);
               }  
             });
         levelsAndCamerasList.style.visibility = "visible";
       }
     }
   }
   
   if (roundsPerMinute) {
     var controller = this.getController();
     controller.goToCamera(home.getTopCamera());
     controller.rotateCameraPitch(Math.PI / 6 - home.getCamera().getPitch());
     controller.moveCamera(10000);
     controller.moveCamera(-50);
     this.clickListener = function(ev) {
         previewComponent.startRotationAnimationAfterLoading = false;
         previewComponent.stopRotationAnimation();
       };
     canvas.addEventListener("keydown", this.clickListener);
     if (window.PointerEvent) {
       // Multi touch support for IE and Edge
       canvas.addEventListener("pointerdown", this.clickListener);
       canvas.addEventListener("pointermove", this.clickListener);
     } else {
       canvas.addEventListener("mousedown", this.clickListener);
       canvas.addEventListener("touchstart",  this.clickListener);
       canvas.addEventListener("touchmove",  this.clickListener);
     }
     var elements = this.component3D.getSimulatedKeyElements(document.getElementsByTagName("body").item(0));
     for (var i = 0; i < elements.length; i++) {
       if (window.PointerEvent) {
         elements [i].addEventListener("pointerdown", this.clickListener);
       } else {
         elements [i].addEventListener("mousedown", this.clickListener);
       }
     }
     this.visibilityChanged = function(ev) {
         if (document.visibilityState == "hidden") {
           previewComponent.stopRotationAnimation();
         }
       }
     document.addEventListener("visibilitychange", this.visibilityChanged);
     document.getElementById(canvasId).focus();
   }
 }
 
 /**
  * Returns the home displayed by this component.
  * @return {Home}
  */
 HomePreviewComponent.prototype.getHome = function() {
   return this.home;
 }
 
 /**
  * Returns the component 3D that displays the home of this component.
  * @return {HomeComponent3D}
  */
 HomePreviewComponent.prototype.getComponent3D = function() {
   return this.component3D;
 }  
 
 /**
  * Returns the controller that manages changes in the home bound to this component.
  * @return {HomeController3D}
  */
 HomePreviewComponent.prototype.getController = function() {
   return this.controller;
 }  
 
 /**
  * Returns the user preferences used by this component.
  * @return {UserPreferences}
  */
 HomePreviewComponent.prototype.getUserPreferences = function() {
   return this.preferences;
 }
 
 /**
  * Tracks furniture models loading to dispose unneeded files and data once read.
  * @private
  */
 HomePreviewComponent.prototype.trackFurnitureModels = function(onprogression, roundsPerMinute) {
   var loadedFurniture = [];
   var loadedJars = {};
   var loadedModels = {};
   var home = this.getHome();
   var furniture = home.getFurniture();          
   for (var i = 0; i < furniture.length; i++) { 
     var piece = furniture [i];
     var pieces = [];
     if (piece instanceof HomeFurnitureGroup) {
       var groupFurniture = piece.getAllFurniture();
       for (var j = 0; j < groupFurniture.length; j++) {
         var childPiece = groupFurniture [j];
         if (!(childPiece instanceof HomeFurnitureGroup)) {
           pieces.push(childPiece);
         }
       }
     } else {
       pieces.push(piece);
     }
     loadedFurniture.push.apply(loadedFurniture, pieces);
     for (var j = 0; j < pieces.length; j++) { 
       var model = pieces [j].getModel();
       if (model.isJAREntry()) {
         var jar = model.getJAREntryURL();
         if (jar in loadedJars) {
           loadedJars [jar]++;
         } else {
           loadedJars [jar] = 1;
         }
       }
       var modelUrl = model.getURL();
       if (modelUrl in loadedModels) {
         loadedModels [modelUrl]++;
       } else {
         loadedModels [modelUrl] = 1;
       }
     }
   }
 
   if (loadedFurniture.length === 0) {
     onprogression(ModelLoader.READING_MODEL, undefined, 1);
   } else {
     // Add an observer that will close ZIP files and free geometries once all models are loaded
     var modelsCount = 0;
     var previewComponent = this;
     for (var i = 0; i < loadedFurniture.length; i++) {
       var managerCall = function(piece) {
         ModelManager.getInstance().loadModel(piece.getModel(), false, {
           modelUpdated : function(modelRoot) {
             var model = piece.getModel();
             if (model.isJAREntry()) {
               var jar = model.getJAREntryURL();
               if (--loadedJars [jar] === 0) {
                 ZIPTools.disposeZIP(jar);
                 delete loadedJars [jar];
               }
             }
             var modelUrl = model.getURL();
             if (--loadedModels [modelUrl] === 0) {
               ModelManager.getInstance().unloadModel(model);
               delete loadedModels [modelUrl];
             }
             onprogression(ModelLoader.READING_MODEL, piece.getName(), ++modelsCount / loadedFurniture.length);
             if (modelsCount === loadedFurniture.length) {
               // Home and its models fully loaded
               // Free all other geometries (background, structure...)  
               previewComponent.component3D.disposeGeometries();
               loadedFurniture = [];
               if (previewComponent.startRotationAnimationAfterLoading) {
                 delete previewComponent.startRotationAnimationAfterLoading;
                 previewComponent.startRotationAnimation(roundsPerMinute); 
               }
             }
           },        
           modelError : function(ex) {
             this.modelUpdated();
           },
           progression : function() {
           }
         });
       };
       managerCall(loadedFurniture [i]);
     }
   }
 }
 
 /**
  * Stops animation, removes listeners bound to global objects and clears this component.
  * This method should be called to free resources in the browser when this component is not needed anymore.
  */
 HomePreviewComponent.prototype.dispose = function() {
   this.stopRotationAnimation();
   if (this.component3D) {
     if (this.clickListener) {
       // Remove listeners bound to global objects
       document.removeEventListener("visibilitychange", this.visibilityChanged);
       var elements = this.component3D.getSimulatedKeyElements(document.getElementsByTagName("body").item(0));
       for (var i = 0; i < elements.length; i++) {
         if (window.PointerEvent) {
           elements [i].removeEventListener("pointerdown", this.clickListener);
         } else {
           elements [i].removeEventListener("mousedown", this.clickListener);
         }
       }
     }
     this.component3D.dispose();
   }
 }
 
 /**
  * Starts rotation animation.
  * @param {number} [roundsPerMinute]  the rotation speed in rounds per minute, 1rpm if missing
  */
 HomePreviewComponent.prototype.startRotationAnimation = function(roundsPerMinute) {
   this.roundsPerMinute = roundsPerMinute !== undefined ? roundsPerMinute : 1;
   if (!this.rotationAnimationStarted) {
     this.rotationAnimationStarted = true;
     this.animate();
   }
 }
 
 /**
  * @private
  */
 HomePreviewComponent.prototype.animate = function() {
   if (this.rotationAnimationStarted) {
     var now = Date.now();
     if (this.lastRotationAnimationTime !== undefined) {
       var angularSpeed = this.roundsPerMinute * 2 * Math.PI / 60000; 
       var yawDelta = ((now - this.lastRotationAnimationTime) * angularSpeed) % (2 * Math.PI);
       yawDelta -= this.home.getCamera().getYaw() - this.lastRotationAnimationYaw;
       if (yawDelta > 0) {
         this.controller.rotateCameraYaw(yawDelta);
       }
     }
     this.lastRotationAnimationTime = now;
     this.lastRotationAnimationYaw = this.home.getCamera().getYaw();
     var previewComponent = this;
     requestAnimationFrame(
         function() {
           previewComponent.animate();
         });
   }
 }
 
 /**
  * Stops the running rotation animation.
  */
 HomePreviewComponent.prototype.stopRotationAnimation = function() {
   delete this.lastRotationAnimationTime;
   delete this.lastRotationAnimationYaw;
   delete this.rotationAnimationStarted;
 }
 
 function HomeRecorder() {}
 HomeRecorder.READING_HOME = "Reading home";
 HomeRecorder.PARSING_HOME = "Parsing home";
 HomeRecorder.prototype.readHome = function(d, c) {
     c.progression(HomeRecorder.READING_HOME, d, 0);
     var b = "Home.xml";
     if (d.indexOf("jar:") === 0) {
         var e = d.indexOf("!/");
         b = d.substring(e + 2);
         d = d.substring(4, e)
     }
     var a = this;
     ZIPTools.getZIP(d, {
         zipReady: function(g) {
             try {
                 var h = g.file(b);
                 if (h !== null) {
                     a.parseHomeXMLEntry(g.file(b), g, d, c)
                 } else {
                     this.zipError("No " + b + " entry in " + d)
                 }
             } catch (f) {
                 this.zipError(f)
             }
         },
         zipError: function(f) {
             if (c.homeError !== undefined) {
                 c.homeError(f)
             }
         },
         progression: function(g, h, f) {
             if (c.progression !== undefined) {
                 c.progression(HomeRecorder.READING_HOME, d, f)
             }
         }
     })
 };
 
 HomeRecorder.prototype.parseHomeXMLEntry = function(h, e, f, b) {
	    var g = h.asText();
	    b.progression(HomeRecorder.READING_HOME, h.name, 1);
	    b.progression(HomeRecorder.PARSING_HOME, h.name, 0);
	    var d = this.getHomeXMLHandler();
	    d.homeUrl = f;
	    var a = new SAXParser(d, d, d, d, d);
	    try {
	        g = g.replace(/\'/g, '"');
	        a.parseString(g);
	        b.homeLoaded(d.getHome())
	    } catch (c) {
	        b.homeError(c)
	    }
	    b.progression(HomeRecorder.PARSING_HOME, h.name, 1)
	};
	
	HomeRecorder.prototype.getHomeXMLHandler = function() {
	    return new HomeXMLHandler()
	};
	
	var HomeXMLHandler = (function(b) {
	    __extends(a, b);

	    function a(c) {
	        var g = this;
	        if (((c != null && c instanceof UserPreferences) || c === null)) {
	            var f = Array.prototype.slice.call(arguments);
	            g = b.call(this) || this;
	            g.preferences = null;
	            g.home = null;
	            g.homeElementName = null;
	            g.labelText = null;
	            g.leftSideBaseboard = null;
	            g.rightSideBaseboard = null;
	            g.homeBackgroundImage = null;
	            g.backgroundImage = null;
	            g.materialTexture = null;
	            g.buffer = {
	                str: "",
	                toString: function() {
	                    return this.str
	                }
	            };
	            g.elements = ([]);
	            g.attributes = ([]);
	            g.groupsFurniture = ([]);
	            g.levels = ({});
	            g.joinedWalls = ({});
	            g.homeProperties = ({});
	            g.properties = ({});
	            g.textStyles = ({});
	            g.textures = ({});
	            g.materials = ([]);
	            g.sashes = ([]);
	            g.lightSources = ([]);
	            g.points = ([]);
	            g.furnitureVisibleProperties = ([]);
	            g.preferences = null;
	            g.home = null;
	            g.homeElementName = null;
	            g.labelText = null;
	            g.leftSideBaseboard = null;
	            g.rightSideBaseboard = null;
	            g.homeBackgroundImage = null;
	            g.backgroundImage = null;
	            g.materialTexture = null;
	            (function() {
	                g.preferences = c != null ? c : new UserPreferences()
	            })()
	        } else {
	            if (c === undefined) {
	                var f = Array.prototype.slice.call(arguments);
	                var d = Array.prototype.slice.call(arguments);
	                var e = null;
	                g = b.call(this) || this;
	                g.preferences = null;
	                g.home = null;
	                g.homeElementName = null;
	                g.labelText = null;
	                g.leftSideBaseboard = null;
	                g.rightSideBaseboard = null;
	                g.homeBackgroundImage = null;
	                g.backgroundImage = null;
	                g.materialTexture = null;
	                g.buffer = {
	                    str: "",
	                    toString: function() {
	                        return this.str
	                    }
	                };
	                g.elements = ([]);
	                g.attributes = ([]);
	                g.groupsFurniture = ([]);
	                g.levels = ({});
	                g.joinedWalls = ({});
	                g.homeProperties = ({});
	                g.properties = ({});
	                g.textStyles = ({});
	                g.textures = ({});
	                g.materials = ([]);
	                g.sashes = ([]);
	                g.lightSources = ([]);
	                g.points = ([]);
	                g.furnitureVisibleProperties = ([]);
	                g.preferences = null;
	                g.home = null;
	                g.homeElementName = null;
	                g.labelText = null;
	                g.leftSideBaseboard = null;
	                g.rightSideBaseboard = null;
	                g.homeBackgroundImage = null;
	                g.backgroundImage = null;
	                g.materialTexture = null;
	                (function() {
	                    g.preferences = e != null ? e : new UserPreferences()
	                })()
	            } else {
	                throw new Error("invalid overload")
	            }
	        }
	        return g
	    }
	    a.prototype.startDocument = function() {
	        this.home = null;
	        (this.elements.length = 0);
	        (this.attributes.length = 0);
	        (this.groupsFurniture.length = 0);
	        (function(c) {
	            for (var d in c) {
	                delete c[d]
	            }
	        })(this.levels);
	        (function(c) {
	            for (var d in c) {
	                delete c[d]
	            }
	        })(this.joinedWalls)
	    };
	    a.prototype.startElement = function(h, d, f, c) {
	        (function(j, i) {
	            return j.str = j.str.substring(0, i)
	        })(this.buffer, 0);
	        (this.elements.push(f) > 0);
	        var e = ({});
	        for (var g = 0; g < c.getLength(); g++) {
	            (e[c.getQName(g)] = c.getValue(g).replace("&quot;", '"').replace("&lt;", "<").replace("&gt;", ">").replace("&amp;", "&"))
	        }(this.attributes.push(e) > 0);
	        if ((function(j, i) {
	                if (j && j.equals) {
	                    return j.equals(i)
	                } else {
	                    return j === i
	                }
	            })("home", f)) {
	            this.setHome(this.createHome(e));
	            (function(i) {
	                for (var j in i) {
	                    delete i[j]
	                }
	            })(this.homeProperties);
	            (this.furnitureVisibleProperties.length = 0);
	            this.homeBackgroundImage = null
	        } else {
	            if ((function(j, i) {
	                    if (j && j.equals) {
	                        return j.equals(i)
	                    } else {
	                        return j === i
	                    }
	                })("environment", f)) {
	                (function(i) {
	                    for (var j in i) {
	                        delete i[j]
	                    }
	                })(this.textures)
	            } else {
	                if ((function(j, i) {
	                        if (j && j.equals) {
	                            return j.equals(i)
	                        } else {
	                            return j === i
	                        }
	                    })("compass", f)) {
	                    (function(i) {
	                        for (var j in i) {
	                            delete i[j]
	                        }
	                    })(this.properties)
	                } else {
	                    if ((function(j, i) {
	                            if (j && j.equals) {
	                                return j.equals(i)
	                            } else {
	                                return j === i
	                            }
	                        })("level", f)) {
	                        (function(i) {
	                            for (var j in i) {
	                                delete i[j]
	                            }
	                        })(this.properties);
	                        this.backgroundImage = null
	                    } else {
	                        if ((function(j, i) {
	                                if (j && j.equals) {
	                                    return j.equals(i)
	                                } else {
	                                    return j === i
	                                }
	                            })("pieceOfFurniture", f) || (function(j, i) {
	                                if (j && j.equals) {
	                                    return j.equals(i)
	                                } else {
	                                    return j === i
	                                }
	                            })("doorOrWindow", f) || (function(j, i) {
	                                if (j && j.equals) {
	                                    return j.equals(i)
	                                } else {
	                                    return j === i
	                                }
	                            })("light", f) || (function(j, i) {
	                                if (j && j.equals) {
	                                    return j.equals(i)
	                                } else {
	                                    return j === i
	                                }
	                            })("furnitureGroup", f)) {
	                            (function(i) {
	                                for (var j in i) {
	                                    delete i[j]
	                                }
	                            })(this.properties);
	                            (function(i) {
	                                for (var j in i) {
	                                    delete i[j]
	                                }
	                            })(this.textStyles);
	                            (function(i) {
	                                for (var j in i) {
	                                    delete i[j]
	                                }
	                            })(this.textures);
	                            (this.materials.length = 0);
	                            (this.sashes.length = 0);
	                            (this.lightSources.length = 0);
	                            if ((function(j, i) {
	                                    if (j && j.equals) {
	                                        return j.equals(i)
	                                    } else {
	                                        return j === i
	                                    }
	                                })("furnitureGroup", f)) {
	                                (this.groupsFurniture.push([]) > 0)
	                            }
	                        } else {
	                            if ((function(j, i) {
	                                    if (j && j.equals) {
	                                        return j.equals(i)
	                                    } else {
	                                        return j === i
	                                    }
	                                })("camera", f) || (function(j, i) {
	                                    if (j && j.equals) {
	                                        return j.equals(i)
	                                    } else {
	                                        return j === i
	                                    }
	                                })("observerCamera", f)) {
	                                (function(i) {
	                                    for (var j in i) {
	                                        delete i[j]
	                                    }
	                                })(this.properties)
	                            } else {
	                                if ((function(j, i) {
	                                        if (j && j.equals) {
	                                            return j.equals(i)
	                                        } else {
	                                            return j === i
	                                        }
	                                    })("room", f)) {
	                                    (function(i) {
	                                        for (var j in i) {
	                                            delete i[j]
	                                        }
	                                    })(this.properties);
	                                    (function(i) {
	                                        for (var j in i) {
	                                            delete i[j]
	                                        }
	                                    })(this.textStyles);
	                                    (function(i) {
	                                        for (var j in i) {
	                                            delete i[j]
	                                        }
	                                    })(this.textures);
	                                    (this.points.length = 0)
	                                } else {
	                                    if ((function(j, i) {
	                                            if (j && j.equals) {
	                                                return j.equals(i)
	                                            } else {
	                                                return j === i
	                                            }
	                                        })("polyline", f)) {
	                                        (function(i) {
	                                            for (var j in i) {
	                                                delete i[j]
	                                            }
	                                        })(this.properties);
	                                        (this.points.length = 0)
	                                    } else {
	                                        if ((function(j, i) {
	                                                if (j && j.equals) {
	                                                    return j.equals(i)
	                                                } else {
	                                                    return j === i
	                                                }
	                                            })("dimensionLine", f)) {
	                                            (function(i) {
	                                                for (var j in i) {
	                                                    delete i[j]
	                                                }
	                                            })(this.properties);
	                                            (function(i) {
	                                                for (var j in i) {
	                                                    delete i[j]
	                                                }
	                                            })(this.textStyles)
	                                        } else {
	                                            if ((function(j, i) {
	                                                    if (j && j.equals) {
	                                                        return j.equals(i)
	                                                    } else {
	                                                        return j === i
	                                                    }
	                                                })("label", f)) {
	                                                (function(i) {
	                                                    for (var j in i) {
	                                                        delete i[j]
	                                                    }
	                                                })(this.properties);
	                                                (function(i) {
	                                                    for (var j in i) {
	                                                        delete i[j]
	                                                    }
	                                                })(this.textStyles);
	                                                this.labelText = null
	                                            } else {
	                                                if ((function(j, i) {
	                                                        if (j && j.equals) {
	                                                            return j.equals(i)
	                                                        } else {
	                                                            return j === i
	                                                        }
	                                                    })("wall", f)) {
	                                                    (function(i) {
	                                                        for (var j in i) {
	                                                            delete i[j]
	                                                        }
	                                                    })(this.properties);
	                                                    (function(i) {
	                                                        for (var j in i) {
	                                                            delete i[j]
	                                                        }
	                                                    })(this.textures);
	                                                    this.leftSideBaseboard = null;
	                                                    this.rightSideBaseboard = null
	                                                } else {
	                                                    if ((function(j, i) {
	                                                            if (j && j.equals) {
	                                                                return j.equals(i)
	                                                            } else {
	                                                                return j === i
	                                                            }
	                                                        })("baseboard", f)) {
	                                                        delete this.textures[a.UNIQUE_ATTRIBUTE]
	                                                    } else {
	                                                        if ((function(j, i) {
	                                                                if (j && j.equals) {
	                                                                    return j.equals(i)
	                                                                } else {
	                                                                    return j === i
	                                                                }
	                                                            })("material", f)) {
	                                                            this.materialTexture = null
	                                                        }
	                                                    }
	                                                }
	                                            }
	                                        }
	                                    }
	                                }
	                            }
	                        }
	                    }
	                }
	            }
	        }
	    };
	    a.prototype.characters = function(c, e, d) {
	        (function(f) {
	            f.str = f.str.concat(c.substr(e, d));
	            return f
	        })(this.buffer)
	    };
	    a.prototype.endElement = function(j, g, x) {
	        this.elements.pop();
	        var m = (this.elements.length == 0) ? null : (function(y) {
	            return y[y.length - 1]
	        })(this.elements);
	        var r = this.attributes.pop();
	        if (this.homeElementName != null && (function(z, y) {
	                if (z && z.equals) {
	                    return z.equals(y)
	                } else {
	                    return z === y
	                }
	            })(this.homeElementName, x)) {
	            this.setHomeAttributes(this.home, x, r)
	        } else {
	            if ((function(z, y) {
	                    if (z && z.equals) {
	                        return z.equals(y)
	                    } else {
	                        return z === y
	                    }
	                })("furnitureVisibleProperty", x)) {
	                try {
	                    if ((function(y, z) {
	                            return y[z] ? y[z] : null
	                        })(r, "name") == null) {
	                        throw new SAXException("Missing name attribute")
	                    }(this.furnitureVisibleProperties.push((function(y, z) {
	                        return y[z] ? y[z] : null
	                    })(r, "name")) > 0)
	                } catch (t) {}
	            } else {
	                if ((function(z, y) {
	                        if (z && z.equals) {
	                            return z.equals(y)
	                        } else {
	                            return z === y
	                        }
	                    })("environment", x)) {
	                    this.setEnvironmentAttributes(this.home.getEnvironment(), x, r)
	                } else {
	                    if ((function(z, y) {
	                            if (z && z.equals) {
	                                return z.equals(y)
	                            } else {
	                                return z === y
	                            }
	                        })("compass", x)) {
	                        this.setCompassAttributes(this.home.getCompass(), x, r)
	                    } else {
	                        if ((function(z, y) {
	                                if (z && z.equals) {
	                                    return z.equals(y)
	                                } else {
	                                    return z === y
	                                }
	                            })("print", x)) {
	                            this.home.setPrint(this.createPrint(r))
	                        } else {
	                            if ((function(z, y) {
	                                    if (z && z.equals) {
	                                        return z.equals(y)
	                                    } else {
	                                        return z === y
	                                    }
	                                })("level", x)) {
	                                var c = this.createLevel(r);
	                                this.setLevelAttributes(c, x, r);
	                                (this.levels[(function(y, z) {
	                                    return y[z] ? y[z] : null
	                                })(r, "id")] = c);
	                                this.home.addLevel(c)
	                            } else {
	                                if ((function(z, y) {
	                                        if (z && z.equals) {
	                                            return z.equals(y)
	                                        } else {
	                                            return z === y
	                                        }
	                                    })("camera", x) || (function(z, y) {
	                                        if (z && z.equals) {
	                                            return z.equals(y)
	                                        } else {
	                                            return z === y
	                                        }
	                                    })("observerCamera", x)) {
	                                    var s = this.createCamera(x, r);
	                                    this.setCameraAttributes(s, x, r);
	                                    var n = (function(y, z) {
	                                        return y[z] ? y[z] : null
	                                    })(r, "attribute");
	                                    if ((function(z, y) {
	                                            if (z && z.equals) {
	                                                return z.equals(y)
	                                            } else {
	                                                return z === y
	                                            }
	                                        })("cameraPath", n)) {
	                                        var q = (this.home.getEnvironment().getVideoCameraPath().slice(0));
	                                        (q.push(s) > 0);
	                                        this.home.getEnvironment().setVideoCameraPath(q)
	                                    } else {
	                                        if ((function(z, y) {
	                                                if (z && z.equals) {
	                                                    return z.equals(y)
	                                                } else {
	                                                    return z === y
	                                                }
	                                            })("topCamera", n)) {
	                                            var h = this.home.getTopCamera();
	                                            h.setCamera(s);
	                                            h.setTime(s.getTime());
	                                            h.setLens(s.getLens())
	                                        } else {
	                                            if ((function(z, y) {
	                                                    if (z && z.equals) {
	                                                        return z.equals(y)
	                                                    } else {
	                                                        return z === y
	                                                    }
	                                                })("observerCamera", n)) {
	                                                var w = this.home.getObserverCamera();
	                                                w.setCamera(s);
	                                                w.setTime(s.getTime());
	                                                w.setLens(s.getLens());
	                                                w.setFixedSize(s.isFixedSize())
	                                            } else {
	                                                if ((function(z, y) {
	                                                        if (z && z.equals) {
	                                                            return z.equals(y)
	                                                        } else {
	                                                            return z === y
	                                                        }
	                                                    })("storedCamera", n)) {
	                                                    var p = (this.home.getStoredCameras().slice(0));
	                                                    (p.push(s) > 0);
	                                                    this.home.setStoredCameras(p)
	                                                }
	                                            }
	                                        }
	                                    }
	                                } else {
	                                    if ((function(z, y) {
	                                            if (z && z.equals) {
	                                                return z.equals(y)
	                                            } else {
	                                                return z === y
	                                            }
	                                        })("pieceOfFurniture", x) || (function(z, y) {
	                                            if (z && z.equals) {
	                                                return z.equals(y)
	                                            } else {
	                                                return z === y
	                                            }
	                                        })("doorOrWindow", x) || (function(z, y) {
	                                            if (z && z.equals) {
	                                                return z.equals(y)
	                                            } else {
	                                                return z === y
	                                            }
	                                        })("light", x) || (function(z, y) {
	                                            if (z && z.equals) {
	                                                return z.equals(y)
	                                            } else {
	                                                return z === y
	                                            }
	                                        })("furnitureGroup", x)) {
	                                        var e = (function(z, y) {
	                                            if (z && z.equals) {
	                                                return z.equals(y)
	                                            } else {
	                                                return z === y
	                                            }
	                                        })("furnitureGroup", x) ? this.createFurnitureGroup(r, this.groupsFurniture.pop()) : this.createPieceOfFurniture(x, r);
	                                        this.setPieceOfFurnitureAttributes(e, x, r);
	                                        if (this.homeElementName != null && (function(z, y) {
	                                                if (z && z.equals) {
	                                                    return z.equals(y)
	                                                } else {
	                                                    return z === y
	                                                }
	                                            })(this.homeElementName, m)) {
	                                            this.home.addPieceOfFurniture$com_eteks_sweethome3d_model_HomePieceOfFurniture(e);
	                                            var f = (function(y, z) {
	                                                return y[z] ? y[z] : null
	                                            })(r, "level");
	                                            if (f != null) {
	                                                e.setLevel((function(y, z) {
	                                                    return y[z] ? y[z] : null
	                                                })(this.levels, f))
	                                            }
	                                        } else {
	                                            if ((function(z, y) {
	                                                    if (z && z.equals) {
	                                                        return z.equals(y)
	                                                    } else {
	                                                        return z === y
	                                                    }
	                                                })("furnitureGroup", m)) {
	                                                ((function(y) {
	                                                    return y[y.length - 1]
	                                                })(this.groupsFurniture).push(e) > 0);
	                                                (function(y) {
	                                                    for (var z in y) {
	                                                        delete y[z]
	                                                    }
	                                                })(this.properties);
	                                                (function(y) {
	                                                    for (var z in y) {
	                                                        delete y[z]
	                                                    }
	                                                })(this.textStyles)
	                                            }
	                                        }
	                                    } else {
	                                        if ((function(z, y) {
	                                                if (z && z.equals) {
	                                                    return z.equals(y)
	                                                } else {
	                                                    return z === y
	                                                }
	                                            })("wall", x)) {
	                                            var v = this.createWall(r);
	                                            (this.joinedWalls[(function(y, z) {
	                                                return y[z] ? y[z] : null
	                                            })(r, "id")] = new a.JoinedWall(v, (function(y, z) {
	                                                return y[z] ? y[z] : null
	                                            })(r, "wallAtStart"), (function(y, z) {
	                                                return y[z] ? y[z] : null
	                                            })(r, "wallAtEnd")));
	                                            this.setWallAttributes(v, x, r);
	                                            this.home.addWall(v);
	                                            var f = (function(y, z) {
	                                                return y[z] ? y[z] : null
	                                            })(r, "level");
	                                            if (f != null) {
	                                                v.setLevel((function(y, z) {
	                                                    return y[z] ? y[z] : null
	                                                })(this.levels, f))
	                                            }
	                                        } else {
	                                            if ((function(z, y) {
	                                                    if (z && z.equals) {
	                                                        return z.equals(y)
	                                                    } else {
	                                                        return z === y
	                                                    }
	                                                })("baseboard", x)) {
	                                                var k = this.createBaseboard(r);
	                                                if ((function(z, y) {
	                                                        if (z && z.equals) {
	                                                            return z.equals(y)
	                                                        } else {
	                                                            return z === y
	                                                        }
	                                                    })("leftSideBaseboard", (function(y, z) {
	                                                        return y[z] ? y[z] : null
	                                                    })(r, "attribute"))) {
	                                                    this.leftSideBaseboard = k
	                                                } else {
	                                                    this.rightSideBaseboard = k
	                                                }
	                                            } else {
	                                                if ((function(z, y) {
	                                                        if (z && z.equals) {
	                                                            return z.equals(y)
	                                                        } else {
	                                                            return z === y
	                                                        }
	                                                    })("room", x)) {
	                                                    var u = this.createRoom(r, this.points.slice(0));
	                                                    this.setRoomAttributes(u, x, r);
	                                                    this.home.addRoom$com_eteks_sweethome3d_model_Room(u);
	                                                    var f = (function(y, z) {
	                                                        return y[z] ? y[z] : null
	                                                    })(r, "level");
	                                                    if (f != null) {
	                                                        u.setLevel((function(y, z) {
	                                                            return y[z] ? y[z] : null
	                                                        })(this.levels, f))
	                                                    }
	                                                } else {
	                                                    if ((function(z, y) {
	                                                            if (z && z.equals) {
	                                                                return z.equals(y)
	                                                            } else {
	                                                                return z === y
	                                                            }
	                                                        })("polyline", x)) {
	                                                        var o = this.createPolyline(r, this.points.slice(0));
	                                                        this.setPolylineAttributes(o, x, r);
	                                                        this.home.addPolyline$com_eteks_sweethome3d_model_Polyline(o);
	                                                        var f = (function(y, z) {
	                                                            return y[z] ? y[z] : null
	                                                        })(r, "level");
	                                                        if (f != null) {
	                                                            o.setLevel((function(y, z) {
	                                                                return y[z] ? y[z] : null
	                                                            })(this.levels, f))
	                                                        }
	                                                    } else {
	                                                        if ((function(z, y) {
	                                                                if (z && z.equals) {
	                                                                    return z.equals(y)
	                                                                } else {
	                                                                    return z === y
	                                                                }
	                                                            })("dimensionLine", x)) {
	                                                            var i = this.createDimensionLine(r);
	                                                            this.setDimensionLineAttributes(i, x, r);
	                                                            this.home.addDimensionLine(i);
	                                                            var f = (function(y, z) {
	                                                                return y[z] ? y[z] : null
	                                                            })(r, "level");
	                                                            if (f != null) {
	                                                                i.setLevel((function(y, z) {
	                                                                    return y[z] ? y[z] : null
	                                                                })(this.levels, f))
	                                                            }
	                                                        } else {
	                                                            if ((function(z, y) {
	                                                                    if (z && z.equals) {
	                                                                        return z.equals(y)
	                                                                    } else {
	                                                                        return z === y
	                                                                    }
	                                                                })("label", x)) {
	                                                                var l = this.createLabel(r, this.labelText);
	                                                                this.setLabelAttributes(l, x, r);
	                                                                this.home.addLabel(l);
	                                                                var f = (function(y, z) {
	                                                                    return y[z] ? y[z] : null
	                                                                })(r, "level");
	                                                                if (f != null) {
	                                                                    l.setLevel((function(y, z) {
	                                                                        return y[z] ? y[z] : null
	                                                                    })(this.levels, f))
	                                                                }
	                                                            } else {
	                                                                if ((function(z, y) {
	                                                                        if (z && z.equals) {
	                                                                            return z.equals(y)
	                                                                        } else {
	                                                                            return z === y
	                                                                        }
	                                                                    })("text", x)) {
	                                                                    this.labelText = this.getCharacters()
	                                                                } else {
	                                                                    if ((function(z, y) {
	                                                                            if (z && z.equals) {
	                                                                                return z.equals(y)
	                                                                            } else {
	                                                                                return z === y
	                                                                            }
	                                                                        })("textStyle", x)) {
	                                                                        var n = (function(y, z) {
	                                                                            return y[z] ? y[z] : null
	                                                                        })(r, "attribute");
	                                                                        (this.textStyles[n != null ? n : a.UNIQUE_ATTRIBUTE] = this.createTextStyle(r))
	                                                                    } else {
	                                                                        if ((function(z, y) {
	                                                                                if (z && z.equals) {
	                                                                                    return z.equals(y)
	                                                                                } else {
	                                                                                    return z === y
	                                                                                }
	                                                                            })("texture", x)) {
	                                                                            if ((function(z, y) {
	                                                                                    if (z && z.equals) {
	                                                                                        return z.equals(y)
	                                                                                    } else {
	                                                                                        return z === y
	                                                                                    }
	                                                                                })("material", m)) {
	                                                                                this.materialTexture = this.createTexture(r)
	                                                                            } else {
	                                                                                var n = (function(y, z) {
	                                                                                    return y[z] ? y[z] : null
	                                                                                })(r, "attribute");
	                                                                                (this.textures[n != null ? n : a.UNIQUE_ATTRIBUTE] = this.createTexture(r))
	                                                                            }
	                                                                        } else {
	                                                                            if ((function(z, y) {
	                                                                                    if (z && z.equals) {
	                                                                                        return z.equals(y)
	                                                                                    } else {
	                                                                                        return z === y
	                                                                                    }
	                                                                                })("material", x)) {
	                                                                                (this.materials.push(this.createMaterial(r)) > 0)
	                                                                            } else {
	                                                                                if ((function(z, y) {
	                                                                                        if (z && z.equals) {
	                                                                                            return z.equals(y)
	                                                                                        } else {
	                                                                                            return z === y
	                                                                                        }
	                                                                                    })("point", x)) {
	                                                                                    (this.points.push([this.parseFloat(r, "x"), this.parseFloat(r, "y")]) > 0)
	                                                                                } else {
	                                                                                    if ((function(z, y) {
	                                                                                            if (z && z.equals) {
	                                                                                                return z.equals(y)
	                                                                                            } else {
	                                                                                                return z === y
	                                                                                            }
	                                                                                        })("sash", x)) {
	                                                                                        (this.sashes.push(new Sash(this.parseFloat(r, "xAxis"), this.parseFloat(r, "yAxis"), this.parseFloat(r, "width"), this.parseFloat(r, "startAngle"), this.parseFloat(r, "endAngle"))) > 0)
	                                                                                    } else {
	                                                                                        if ((function(z, y) {
	                                                                                                if (z && z.equals) {
	                                                                                                    return z.equals(y)
	                                                                                                } else {
	                                                                                                    return z === y
	                                                                                                }
	                                                                                            })("lightSource", x)) {
	                                                                                            (this.lightSources.push(new LightSource(this.parseFloat(r, "x"), this.parseFloat(r, "y"), this.parseFloat(r, "z"), this.parseOptionalColor(r, "color"), this.parseOptionalFloat(r, "diameter"))) > 0)
	                                                                                        } else {
	                                                                                            if ((function(z, y) {
	                                                                                                    if (z && z.equals) {
	                                                                                                        return z.equals(y)
	                                                                                                    } else {
	                                                                                                        return z === y
	                                                                                                    }
	                                                                                                })("backgroundImage", x)) {
	                                                                                                var d = new BackgroundImage(this.parseContent((function(y, z) {
	                                                                                                    return y[z] ? y[z] : null
	                                                                                                })(r, "image"), null), this.parseFloat(r, "scaleDistance"), this.parseFloat(r, "scaleDistanceXStart"), this.parseFloat(r, "scaleDistanceYStart"), this.parseFloat(r, "scaleDistanceXEnd"), this.parseFloat(r, "scaleDistanceYEnd"), (function(y, z) {
	                                                                                                    return y[z] ? y[z] : null
	                                                                                                })(r, "xOrigin") != null ? this.parseFloat(r, "xOrigin") : 0, (function(y, z) {
	                                                                                                    return y[z] ? y[z] : null
	                                                                                                })(r, "yOrigin") != null ? this.parseFloat(r, "yOrigin") : 0, !(function(z, y) {
	                                                                                                    if (z && z.equals) {
	                                                                                                        return z.equals(y)
	                                                                                                    } else {
	                                                                                                        return z === y
	                                                                                                    }
	                                                                                                })("false", (function(y, z) {
	                                                                                                    return y[z] ? y[z] : null
	                                                                                                })(r, "visible")));
	                                                                                                if (this.homeElementName != null && (function(z, y) {
	                                                                                                        if (z && z.equals) {
	                                                                                                            return z.equals(y)
	                                                                                                        } else {
	                                                                                                            return z === y
	                                                                                                        }
	                                                                                                    })(this.homeElementName, m)) {
	                                                                                                    this.homeBackgroundImage = d
	                                                                                                } else {
	                                                                                                    this.backgroundImage = d
	                                                                                                }
	                                                                                            } else {
	                                                                                                if ((function(z, y) {
	                                                                                                        if (z && z.equals) {
	                                                                                                            return z.equals(y)
	                                                                                                        } else {
	                                                                                                            return z === y
	                                                                                                        }
	                                                                                                    })("property", x)) {
	                                                                                                    if (this.homeElementName != null) {
	                                                                                                        if ((function(z, y) {
	                                                                                                                if (z && z.equals) {
	                                                                                                                    return z.equals(y)
	                                                                                                                } else {
	                                                                                                                    return z === y
	                                                                                                                }
	                                                                                                            })(this.homeElementName, m)) {
	                                                                                                            (this.homeProperties[(function(y, z) {
	                                                                                                                return y[z] ? y[z] : null
	                                                                                                            })(r, "name")] = (function(y, z) {
	                                                                                                                return y[z] ? y[z] : null
	                                                                                                            })(r, "value"))
	                                                                                                        } else {
	                                                                                                            (this.properties[(function(y, z) {
	                                                                                                                return y[z] ? y[z] : null
	                                                                                                            })(r, "name")] = (function(y, z) {
	                                                                                                                return y[z] ? y[z] : null
	                                                                                                            })(r, "value"))
	                                                                                                        }
	                                                                                                    }
	                                                                                                }
	                                                                                            }
	                                                                                        }
	                                                                                    }
	                                                                                }
	                                                                            }
	                                                                        }
	                                                                    }
	                                                                }
	                                                            }
	                                                        }
	                                                    }
	                                                }
	                                            }
	                                        }
	                                    }
	                                }
	                            }
	                        }
	                    }
	                }
	            }
	        }
	    };
	    a.prototype.getCharacters = function() {
	        return this.buffer.str.replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&")
	    };
	    a.prototype.endDocument = function() {
	        var e = (function(i) {
	            return Object.keys(i).map(function(j) {
	                return i[j]
	            })
	        })(this.joinedWalls);
	        for (var h = 0; h < e.length; h++) {
	            var f = e[h];
	            var c = f.getWall();
	            if (f.getWallAtStartId() != null) {
	                var d = (function(i, j) {
	                    return i[j] ? i[j] : null
	                })(this.joinedWalls, f.getWallAtStartId());
	                if (d != null) {
	                    c.setWallAtStart(d.getWall())
	                }
	            }
	            if (f.getWallAtEndId() != null) {
	                var g = (function(i, j) {
	                    return i[j] ? i[j] : null
	                })(this.joinedWalls, f.getWallAtEndId());
	                if (g != null) {
	                    c.setWallAtEnd(g.getWall())
	                }
	            }
	        }
	    };
	    a.prototype.createHome = function(d) {
	        var f;
	        if ((function(g, h) {
	                return g[h] ? g[h] : null
	            })(d, "wallHeight") != null) {
	            f = new Home(this.parseFloat(d, "wallHeight"))
	        } else {
	            f = new Home()
	        }
	        var c = (function(g, h) {
	            return g[h] ? g[h] : null
	        })(d, "version");
	        if (c != null) {
	            try {
	                f.setVersion(parseInt(c))
	            } catch (e) {
	                throw new SAXException("Invalid value for integer attribute version", e)
	            }
	        }
	        return f
	    };
	    a.prototype.setHomeAttributes = function(h, k, d) {
	        var e = (function(n) {
	            var l = [];
	            for (var m in n) {
	                l.push({
	                    k: m,
	                    v: n[m],
	                    getKey: function() {
	                        return this.k
	                    },
	                    getValue: function() {
	                        return this.v
	                    }
	                })
	            }
	            return l
	        })(this.homeProperties);
	        for (var f = 0; f < e.length; f++) {
	            var j = e[f];
	            h.setProperty(j.getKey(), j.getValue())
	        }
	        if (this.furnitureVisibleProperties.length > 0) {
	            this.home.setFurnitureVisibleProperties(this.furnitureVisibleProperties)
	        }
	        this.home.setBackgroundImage(this.homeBackgroundImage);
	        h.setName((function(l, n) {
	            return l[n] ? l[n] : null
	        })(d, "name"));
	        var i = (function(l, n) {
	            return l[n] ? l[n] : null
	        })(d, "selectedLevel");
	        if (i != null) {
	            this.home.setSelectedLevel((function(l, n) {
	                return l[n] ? l[n] : null
	            })(this.levels, i))
	        }
	        if ((function(m, l) {
	                if (m && m.equals) {
	                    return m.equals(l)
	                } else {
	                    return m === l
	                }
	            })("observerCamera", (function(l, n) {
	                return l[n] ? l[n] : null
	            })(d, "camera"))) {
	            this.home.setCamera(this.home.getObserverCamera())
	        }
	        h.setBasePlanLocked((function(m, l) {
	            if (m && m.equals) {
	                return m.equals(l)
	            } else {
	                return m === l
	            }
	        })("true", (function(l, n) {
	            return l[n] ? l[n] : null
	        })(d, "basePlanLocked")));
	        var c = (function(l, n) {
	            return l[n] ? l[n] : null
	        })(d, "furnitureSortedProperty");
	        if (c != null) {
	            try {
	                h.setFurnitureSortedProperty(c)
	            } catch (g) {}
	        }
	        h.setFurnitureDescendingSorted((function(m, l) {
	            if (m && m.equals) {
	                return m.equals(l)
	            } else {
	                return m === l
	            }
	        })("true", (function(l, n) {
	            return l[n] ? l[n] : null
	        })(d, "furnitureDescendingSorted")));
	        if (d.structure) {
	            h.structure = this.parseContent(d.structure, null)
	        }
	    };
	    a.prototype.setEnvironmentAttributes = function(s, j, h) {
	        var t = this.parseOptionalColor(h, "groundColor");
	        if (t != null) {
	            s.setGroundColor(t)
	        }
	        s.setGroundTexture((function(v, w) {
	            return v[w] ? v[w] : null
	        })(this.textures, "groundTexture"));
	        var q = this.parseOptionalColor(h, "skyColor");
	        if (q != null) {
	            s.setSkyColor(q)
	        }
	        s.setSkyTexture((function(v, w) {
	            return v[w] ? v[w] : null
	        })(this.textures, "skyTexture"));
	        var l = this.parseOptionalColor(h, "lightColor");
	        if (l != null) {
	            s.setLightColor(l)
	        }
	        var i = this.parseOptionalFloat(h, "wallsAlpha");
	        if (i != null) {
	            s.setWallsAlpha(i)
	        }
	        s.setAllLevelsVisible((function(w, v) {
	            if (w && w.equals) {
	                return w.equals(v)
	            } else {
	                return w === v
	            }
	        })("true", (function(v, w) {
	            return v[w] ? v[w] : null
	        })(h, "allLevelsVisible")));
	        s.setObserverCameraElevationAdjusted(!(function(w, v) {
	            if (w && w.equals) {
	                return w.equals(v)
	            } else {
	                return w === v
	            }
	        })("false", (function(v, w) {
	            return v[w] ? v[w] : null
	        })(h, "observerCameraElevationAdjusted")));
	        var d = this.parseOptionalColor(h, "ceillingLightColor");
	        if (d != null) {
	            s.setCeillingLightColor(d)
	        }
	        var c = (function(v, w) {
	            return v[w] ? v[w] : null
	        })(h, "drawingMode");
	        if (c != null) {
	            try {
	                s.setDrawingMode(HomeEnvironment.DrawingMode[c])
	            } catch (o) {}
	        }
	        var g = this.parseOptionalFloat(h, "subpartSizeUnderLight");
	        if (g != null) {
	            s.setSubpartSizeUnderLight(g)
	        }
	        var n = this.parseOptionalInteger(h, "photoWidth");
	        if (n != null) {
	            s.setPhotoWidth(n)
	        }
	        var m = this.parseOptionalInteger(h, "photoHeight");
	        if (m != null) {
	            s.setPhotoHeight(m)
	        }
	        var p = (function(v, w) {
	            return v[w] ? v[w] : null
	        })(h, "photoAspectRatio");
	        if (p != null) {
	            try {
	                s.setPhotoAspectRatio(AspectRatio[p])
	            } catch (o) {}
	        }
	        var u = this.parseOptionalInteger(h, "photoQuality");
	        if (u != null) {
	            s.setPhotoQuality(u)
	        }
	        var f = this.parseOptionalInteger(h, "videoWidth");
	        if (f != null) {
	            s.setVideoWidth(f)
	        }
	        var e = (function(v, w) {
	            return v[w] ? v[w] : null
	        })(h, "videoAspectRatio");
	        if (e != null) {
	            try {
	                s.setVideoAspectRatio(AspectRatio[e])
	            } catch (o) {}
	        }
	        var r = this.parseOptionalInteger(h, "videoQuality");
	        if (r != null) {
	            s.setVideoQuality(r)
	        }
	        var k = this.parseOptionalInteger(h, "videoFrameRate");
	        if (k != null) {
	            s.setVideoFrameRate(k)
	        }
	    };
	    a.prototype.createPrint = function(c) {
	        var e = HomePrint.PaperOrientation.PORTRAIT;
	        try {
	            if ((function(f, g) {
	                    return f[g] ? f[g] : null
	                })(c, "paperOrientation") == null) {
	                throw new SAXException("Missing paperOrientation attribute")
	            }
	            e = HomePrint.PaperOrientation[(function(f, g) {
	                return f[g] ? f[g] : null
	            })(c, "paperOrientation")]
	        } catch (d) {}
	        return new HomePrint(e, this.parseFloat(c, "paperWidth"), this.parseFloat(c, "paperHeight"), this.parseFloat(c, "paperTopMargin"), this.parseFloat(c, "paperLeftMargin"), this.parseFloat(c, "paperBottomMargin"), this.parseFloat(c, "paperRightMargin"), !(function(g, f) {
	            if (g && g.equals) {
	                return g.equals(f)
	            } else {
	                return g === f
	            }
	        })("false", (function(f, g) {
	            return f[g] ? f[g] : null
	        })(c, "furniturePrinted")), !(function(g, f) {
	            if (g && g.equals) {
	                return g.equals(f)
	            } else {
	                return g === f
	            }
	        })("false", (function(f, g) {
	            return f[g] ? f[g] : null
	        })(c, "planPrinted")), !(function(g, f) {
	            if (g && g.equals) {
	                return g.equals(f)
	            } else {
	                return g === f
	            }
	        })("false", (function(f, g) {
	            return f[g] ? f[g] : null
	        })(c, "view3DPrinted")), this.parseOptionalFloat(c, "planScale"), (function(f, g) {
	            return f[g] ? f[g] : null
	        })(c, "headerFormat"), (function(f, g) {
	            return f[g] ? f[g] : null
	        })(c, "footerFormat"))
	    };
	    a.prototype.setCompassAttributes = function(g, c, d) {
	        this.setProperties(g);
	        g.setX(this.parseOptionalFloat(d, "x"));
	        g.setY(this.parseOptionalFloat(d, "y"));
	        g.setDiameter(this.parseOptionalFloat(d, "diameter"));
	        var f = this.parseOptionalFloat(d, "northDirection");
	        if (f != null) {
	            g.setNorthDirection(f)
	        }
	        var h = this.parseOptionalFloat(d, "longitude");
	        if (h != null) {
	            g.setLongitude(h)
	        }
	        var i = this.parseOptionalFloat(d, "latitude");
	        if (i != null) {
	            g.setLatitude(i)
	        }
	        var e = (function(j, l) {
	            return j[l] ? j[l] : null
	        })(d, "timeZone");
	        if (e != null) {
	            g.setTimeZone(e)
	        }
	        g.setVisible(!(function(k, j) {
	            if (k && k.equals) {
	                return k.equals(j)
	            } else {
	                return k === j
	            }
	        })("false", (function(j, l) {
	            return j[l] ? j[l] : null
	        })(d, "visible")))
	    };
	    a.prototype.createCamera = function(c, d) {
	        if ((function(f, e) {
	                if (f && f.equals) {
	                    return f.equals(e)
	                } else {
	                    return f === e
	                }
	            })("observerCamera", c)) {
	            return new ObserverCamera(this.parseFloat(d, "x"), this.parseFloat(d, "y"), this.parseFloat(d, "z"), this.parseFloat(d, "yaw"), this.parseFloat(d, "pitch"), this.parseFloat(d, "fieldOfView"))
	        } else {
	            return new Camera(this.parseFloat(d, "x"), this.parseFloat(d, "y"), this.parseFloat(d, "z"), this.parseFloat(d, "yaw"), this.parseFloat(d, "pitch"), this.parseFloat(d, "fieldOfView"))
	        }
	    };
	    a.prototype.setCameraAttributes = function(g, c, d) {
	        this.setProperties(g);
	        if (g != null && g instanceof ObserverCamera) {
	            g.setFixedSize((function(j, i) {
	                if (j && j.equals) {
	                    return j.equals(i)
	                } else {
	                    return j === i
	                }
	            })("true", (function(i, j) {
	                return i[j] ? i[j] : null
	            })(d, "fixedSize")))
	        }
	        var e = (function(i, j) {
	            return i[j] ? i[j] : null
	        })(d, "lens");
	        if (e != null) {
	            try {
	                g.setLens(Camera.Lens[e])
	            } catch (f) {}
	        }
	        var h = (function(i, j) {
	            return i[j] ? i[j] : null
	        })(d, "time");
	        if (h != null) {
	            try {
	                g.setTime(parseInt(h))
	            } catch (f) {
	                throw new SAXException("Invalid value for long attribute time", f)
	            }
	        }
	        g.setName((function(i, j) {
	            return i[j] ? i[j] : null
	        })(d, "name"))
	    };
	    a.prototype.createLevel = function(c) {
	        return new Level((function(d, e) {
	            return d[e] ? d[e] : null
	        })(c, "name"), this.parseFloat(c, "elevation"), this.parseFloat(c, "floorThickness"), this.parseFloat(c, "height"))
	    };
	    a.prototype.setLevelAttributes = function(f, c, e) {
	        this.setProperties(f);
	        f.setBackgroundImage(this.backgroundImage);
	        var d = this.parseOptionalInteger(e, "elevationIndex");
	        if (d != null) {
	            f.setElevationIndex(d)
	        }
	        f.setVisible(!(function(h, g) {
	            if (h && h.equals) {
	                return h.equals(g)
	            } else {
	                return h === g
	            }
	        })("false", (function(g, h) {
	            return g[h] ? g[h] : null
	        })(e, "visible")));
	        f.setViewable(!(function(h, g) {
	            if (h && h.equals) {
	                return h.equals(g)
	            } else {
	                return h === g
	            }
	        })("false", (function(g, h) {
	            return g[h] ? g[h] : null
	        })(e, "viewable")))
	    };
	    a.prototype.createPieceOfFurniture = function(n, f) {
	        var e = (function(o, p) {
	            return o[p] ? o[p] : null
	        })(f, "catalogId");
	        var m = (function(o, p) {
	            return o[p] ? o[p] : null
	        })(f, "tags") != null ? (function(o, p) {
	            return o[p] ? o[p] : null
	        })(f, "tags").split(" ") : null;
	        var l = (function(o, p) {
	            return o[p] ? o[p] : null
	        })(f, "elevation") != null ? this.parseFloat(f, "elevation") : 0;
	        var d = (function(o, p) {
	            return o[p] ? o[p] : null
	        })(f, "dropOnTopElevation") != null ? this.parseFloat(f, "dropOnTopElevation") : 1;
	        var c = null;
	        if ((function(o, p) {
	                return o[p] ? o[p] : null
	            })(f, "modelRotation") != null) {
	            var k = (function(o, p) {
	                return o[p] ? o[p] : null
	            })(f, "modelRotation").split(" ", 9);
	            if (k.length < 9) {
	                throw new SAXException("Missing values for attribute modelRotation")
	            }
	            try {
	                c = [
	                    [parseFloat(k[0]), parseFloat(k[1]), parseFloat(k[2])],
	                    [parseFloat(k[3]), parseFloat(k[4]), parseFloat(k[5])],
	                    [parseFloat(k[6]), parseFloat(k[7]), parseFloat(k[8])]
	                ]
	            } catch (i) {
	                throw new SAXException("Invalid value for attribute modelRotation", i)
	            }
	        }
	        if ((function(p, o) {
	                if (p && p.equals) {
	                    return p.equals(o)
	                } else {
	                    return p === o
	                }
	            })("doorOrWindow", n) || (function(p, o) {
	                if (p && p.equals) {
	                    return p.equals(o)
	                } else {
	                    return p === o
	                }
	            })("true", (function(o, p) {
	                return o[p] ? o[p] : null
	            })(f, "doorOrWindow"))) {
	            var h = (function(o, p) {
	                return o[p] ? o[p] : null
	            })(f, "wallThickness") != null ? this.parseFloat(f, "wallThickness") : 1;
	            var j = (function(o, p) {
	                return o[p] ? o[p] : null
	            })(f, "wallDistance") != null ? this.parseFloat(f, "wallDistance") : 0;
	            var g = (function(o, p) {
	                return o[p] ? o[p] : null
	            })(f, "cutOutShape");
	            if (g == null && !(function(p, o) {
	                    if (p && p.equals) {
	                        return p.equals(o)
	                    } else {
	                        return p === o
	                    }
	                })("doorOrWindow", n)) {
	                g = "M0,0 v1 h1 v-1 z"
	            }
	            return new HomeDoorOrWindow(new CatalogDoorOrWindow(e, (function(o, p) {
	                return o[p] ? o[p] : null
	            })(f, "name"), (function(o, p) {
	                return o[p] ? o[p] : null
	            })(f, "description"), (function(o, p) {
	                return o[p] ? o[p] : null
	            })(f, "information"), m, this.parseOptionalLong(f, "creationDate"), this.parseOptionalFloat(f, "grade"), this.parseContent((function(o, p) {
	                return o[p] ? o[p] : null
	            })(f, "icon"), e), this.parseContent((function(o, p) {
	                return o[p] ? o[p] : null
	            })(f, "planIcon"), e), this.parseContent((function(o, p) {
	                return o[p] ? o[p] : null
	            })(f, "model"), e), this.parseFloat(f, "width"), this.parseFloat(f, "depth"), this.parseFloat(f, "height"), l, d, !(function(p, o) {
	                if (p && p.equals) {
	                    return p.equals(o)
	                } else {
	                    return p === o
	                }
	            })("false", (function(o, p) {
	                return o[p] ? o[p] : null
	            })(f, "movable")), g, h, j, (function(p, o) {
	                if (p && p.equals) {
	                    return p.equals(o)
	                } else {
	                    return p === o
	                }
	            })("true", (function(o, p) {
	                return o[p] ? o[p] : null
	            })(f, "wallCutOutOnBothSides")), !(function(p, o) {
	                if (p && p.equals) {
	                    return p.equals(o)
	                } else {
	                    return p === o
	                }
	            })("false", (function(o, p) {
	                return o[p] ? o[p] : null
	            })(f, "widthDepthDeformable")), this.sashes.slice(0), c, (function(p, o) {
	                if (p && p.equals) {
	                    return p.equals(o)
	                } else {
	                    return p === o
	                }
	            })("true", (function(o, p) {
	                return o[p] ? o[p] : null
	            })(f, "backFaceShown")), this.parseOptionalLong(f, "modelSize"), (function(o, p) {
	                return o[p] ? o[p] : null
	            })(f, "creator"), !(function(p, o) {
	                if (p && p.equals) {
	                    return p.equals(o)
	                } else {
	                    return p === o
	                }
	            })("false", (function(o, p) {
	                return o[p] ? o[p] : null
	            })(f, "resizable")), !(function(p, o) {
	                if (p && p.equals) {
	                    return p.equals(o)
	                } else {
	                    return p === o
	                }
	            })("false", (function(o, p) {
	                return o[p] ? o[p] : null
	            })(f, "deformable")), !(function(p, o) {
	                if (p && p.equals) {
	                    return p.equals(o)
	                } else {
	                    return p === o
	                }
	            })("false", (function(o, p) {
	                return o[p] ? o[p] : null
	            })(f, "texturable")), this.parseOptionalDecimal(f, "price"), this.parseOptionalDecimal(f, "valueAddedTaxPercentage"), (function(o, p) {
	                return o[p] ? o[p] : null
	            })(f, "currency")))
	        } else {
	            if ((function(p, o) {
	                    if (p && p.equals) {
	                        return p.equals(o)
	                    } else {
	                        return p === o
	                    }
	                })("light", n)) {
	                return new HomeLight(new CatalogLight(e, (function(o, p) {
	                    return o[p] ? o[p] : null
	                })(f, "name"), (function(o, p) {
	                    return o[p] ? o[p] : null
	                })(f, "description"), (function(o, p) {
	                    return o[p] ? o[p] : null
	                })(f, "information"), m, this.parseOptionalLong(f, "creationDate"), this.parseOptionalFloat(f, "grade"), this.parseContent((function(o, p) {
	                    return o[p] ? o[p] : null
	                })(f, "icon"), e), this.parseContent((function(o, p) {
	                    return o[p] ? o[p] : null
	                })(f, "planIcon"), e), this.parseContent((function(o, p) {
	                    return o[p] ? o[p] : null
	                })(f, "model"), e), this.parseFloat(f, "width"), this.parseFloat(f, "depth"), this.parseFloat(f, "height"), l, d, !(function(p, o) {
	                    if (p && p.equals) {
	                        return p.equals(o)
	                    } else {
	                        return p === o
	                    }
	                })("false", (function(o, p) {
	                    return o[p] ? o[p] : null
	                })(f, "movable")), this.lightSources.slice(0), (function(o, p) {
	                    return o[p] ? o[p] : null
	                })(f, "staircaseCutOutShape"), c, (function(p, o) {
	                    if (p && p.equals) {
	                        return p.equals(o)
	                    } else {
	                        return p === o
	                    }
	                })("true", (function(o, p) {
	                    return o[p] ? o[p] : null
	                })(f, "backFaceShown")), this.parseOptionalLong(f, "modelSize"), (function(o, p) {
	                    return o[p] ? o[p] : null
	                })(f, "creator"), !(function(p, o) {
	                    if (p && p.equals) {
	                        return p.equals(o)
	                    } else {
	                        return p === o
	                    }
	                })("false", (function(o, p) {
	                    return o[p] ? o[p] : null
	                })(f, "resizable")), !(function(p, o) {
	                    if (p && p.equals) {
	                        return p.equals(o)
	                    } else {
	                        return p === o
	                    }
	                })("false", (function(o, p) {
	                    return o[p] ? o[p] : null
	                })(f, "deformable")), !(function(p, o) {
	                    if (p && p.equals) {
	                        return p.equals(o)
	                    } else {
	                        return p === o
	                    }
	                })("false", (function(o, p) {
	                    return o[p] ? o[p] : null
	                })(f, "texturable")), !(function(p, o) {
	                    if (p && p.equals) {
	                        return p.equals(o)
	                    } else {
	                        return p === o
	                    }
	                })("false", (function(o, p) {
	                    return o[p] ? o[p] : null
	                })(f, "horizontallyRotatable")), this.parseOptionalDecimal(f, "price"), this.parseOptionalDecimal(f, "valueAddedTaxPercentage"), (function(o, p) {
	                    return o[p] ? o[p] : null
	                })(f, "currency")))
	            } else {
	                return new HomePieceOfFurniture(new CatalogPieceOfFurniture(e, (function(o, p) {
	                    return o[p] ? o[p] : null
	                })(f, "name"), (function(o, p) {
	                    return o[p] ? o[p] : null
	                })(f, "description"), (function(o, p) {
	                    return o[p] ? o[p] : null
	                })(f, "information"), m, this.parseOptionalLong(f, "creationDate"), this.parseOptionalFloat(f, "grade"), this.parseContent((function(o, p) {
	                    return o[p] ? o[p] : null
	                })(f, "icon"), e), this.parseContent((function(o, p) {
	                    return o[p] ? o[p] : null
	                })(f, "planIcon"), e), this.parseContent((function(o, p) {
	                    return o[p] ? o[p] : null
	                })(f, "model"), e), this.parseFloat(f, "width"), this.parseFloat(f, "depth"), this.parseFloat(f, "height"), l, d, !(function(p, o) {
	                    if (p && p.equals) {
	                        return p.equals(o)
	                    } else {
	                        return p === o
	                    }
	                })("false", (function(o, p) {
	                    return o[p] ? o[p] : null
	                })(f, "movable")), (function(o, p) {
	                    return o[p] ? o[p] : null
	                })(f, "staircaseCutOutShape"), c, (function(p, o) {
	                    if (p && p.equals) {
	                        return p.equals(o)
	                    } else {
	                        return p === o
	                    }
	                })("true", (function(o, p) {
	                    return o[p] ? o[p] : null
	                })(f, "backFaceShown")), this.parseOptionalLong(f, "modelSize"), (function(o, p) {
	                    return o[p] ? o[p] : null
	                })(f, "creator"), !(function(p, o) {
	                    if (p && p.equals) {
	                        return p.equals(o)
	                    } else {
	                        return p === o
	                    }
	                })("false", (function(o, p) {
	                    return o[p] ? o[p] : null
	                })(f, "resizable")), !(function(p, o) {
	                    if (p && p.equals) {
	                        return p.equals(o)
	                    } else {
	                        return p === o
	                    }
	                })("false", (function(o, p) {
	                    return o[p] ? o[p] : null
	                })(f, "deformable")), !(function(p, o) {
	                    if (p && p.equals) {
	                        return p.equals(o)
	                    } else {
	                        return p === o
	                    }
	                })("false", (function(o, p) {
	                    return o[p] ? o[p] : null
	                })(f, "texturable")), !(function(p, o) {
	                    if (p && p.equals) {
	                        return p.equals(o)
	                    } else {
	                        return p === o
	                    }
	                })("false", (function(o, p) {
	                    return o[p] ? o[p] : null
	                })(f, "horizontallyRotatable")), this.parseOptionalDecimal(f, "price"), this.parseOptionalDecimal(f, "valueAddedTaxPercentage"), (function(o, p) {
	                    return o[p] ? o[p] : null
	                })(f, "currency")))
	            }
	        }
	    };
	    a.prototype.createFurnitureGroup = function(c, d) {
	        return new HomeFurnitureGroup(d, (function(e, f) {
	            return e[f] ? e[f] : null
	        })(c, "angle") != null ? this.parseFloat(c, "angle") : 0, (function(f, e) {
	            if (f && f.equals) {
	                return f.equals(e)
	            } else {
	                return f === e
	            }
	        })("true", (function(e, f) {
	            return e[f] ? e[f] : null
	        })(c, "modelMirrored")), (function(e, f) {
	            return e[f] ? e[f] : null
	        })(c, "name"))
	    };
	    a.prototype.setPieceOfFurnitureAttributes = function(r, s, k) {
	        this.setProperties(r);
	        r.setNameStyle((function(t, u) {
	            return t[u] ? t[u] : null
	        })(this.textStyles, "nameStyle"));
	        r.setNameVisible((function(u, t) {
	            if (u && u.equals) {
	                return u.equals(t)
	            } else {
	                return u === t
	            }
	        })("true", (function(t, u) {
	            return t[u] ? t[u] : null
	        })(k, "nameVisible")));
	        var i = this.parseOptionalFloat(k, "nameAngle");
	        if (i != null) {
	            r.setNameAngle(i)
	        }
	        var g = this.parseOptionalFloat(k, "nameXOffset");
	        if (g != null) {
	            r.setNameXOffset(g)
	        }
	        var q = this.parseOptionalFloat(k, "nameYOffset");
	        if (q != null) {
	            r.setNameYOffset(q)
	        }
	        r.setVisible(!(function(u, t) {
	            if (u && u.equals) {
	                return u.equals(t)
	            } else {
	                return u === t
	            }
	        })("false", (function(t, u) {
	            return t[u] ? t[u] : null
	        })(k, "visible")));
	        if (!(r != null && r instanceof HomeFurnitureGroup)) {
	            var o = this.parseOptionalFloat(k, "x");
	            if (o != null) {
	                r.setX(o)
	            }
	            var n = this.parseOptionalFloat(k, "y");
	            if (n != null) {
	                r.setY(n)
	            }
	            var f = this.parseOptionalFloat(k, "angle");
	            if (f != null) {
	                r.setAngle(f)
	            }
	            if (r.isHorizontallyRotatable()) {
	                var e = this.parseOptionalFloat(k, "pitch");
	                if (e != null) {
	                    r.setPitch(e)
	                }
	                var d = this.parseOptionalFloat(k, "roll");
	                if (d != null) {
	                    r.setRoll(d)
	                }
	            }
	            var m = this.parseOptionalFloat(k, "widthInPlan");
	            if (m != null) {
	                r.setWidthInPlan(m)
	            }
	            var c = this.parseOptionalFloat(k, "depthInPlan");
	            if (c != null) {
	                r.setDepthInPlan(c)
	            }
	            var j = this.parseOptionalFloat(k, "heightInPlan");
	            if (j != null) {
	                r.setHeightInPlan(j)
	            }
	            if (this.home.getVersion() < 5500 || (function(u, t) {
	                    if (u && u.equals) {
	                        return u.equals(t)
	                    } else {
	                        return u === t
	                    }
	                })("false", (function(t, u) {
	                    return t[u] ? t[u] : null
	                })(k, "modelCenteredAtOrigin"))) {
	                r.setModelCenteredAtOrigin((function(t, u) {
	                    return t[u] ? t[u] : null
	                })(k, "modelRotation") == null)
	            }
	            if (r.isResizable()) {
	                r.setModelMirrored((function(u, t) {
	                    if (u && u.equals) {
	                        return u.equals(t)
	                    } else {
	                        return u === t
	                    }
	                })("true", (function(t, u) {
	                    return t[u] ? t[u] : null
	                })(k, "modelMirrored")))
	            }
	            if (r.isTexturable()) {
	                if (this.materials.length > 0) {
	                    r.setModelMaterials(this.materials.slice(0))
	                }
	                var h = this.parseOptionalColor(k, "color");
	                if (h != null) {
	                    r.setColor(h)
	                }
	                var l = (function(t, u) {
	                    return t[u] ? t[u] : null
	                })(this.textures, a.UNIQUE_ATTRIBUTE);
	                if (l != null) {
	                    r.setTexture(l)
	                }
	                var p = this.parseOptionalFloat(k, "shininess");
	                if (p != null) {
	                    r.setShininess(p)
	                }
	            }
	            if ((r != null && r instanceof HomeLight) && (function(t, u) {
	                    return t[u] ? t[u] : null
	                })(k, "power") != null) {
	                r.setPower(this.parseFloat(k, "power"))
	            } else {
	                if ((r != null && r instanceof HomeDoorOrWindow) && (function(u, t) {
	                        if (u && u.equals) {
	                            return u.equals(t)
	                        } else {
	                            return u === t
	                        }
	                    })("doorOrWindow", s)) {
	                    r.setBoundToWall(!(function(u, t) {
	                        if (u && u.equals) {
	                            return u.equals(t)
	                        } else {
	                            return u === t
	                        }
	                    })("false", (function(t, u) {
	                        return t[u] ? t[u] : null
	                    })(k, "boundToWall")))
	                }
	            }
	        }
	    };
	    a.prototype.createWall = function(c) {
	        return new Wall(this.parseFloat(c, "xStart"), this.parseFloat(c, "yStart"), this.parseFloat(c, "xEnd"), this.parseFloat(c, "yEnd"), this.parseFloat(c, "thickness"), 0)
	    };
	    a.prototype.setWallAttributes = function(d, c, f) {
	        this.setProperties(d);
	        d.setLeftSideBaseboard(this.leftSideBaseboard);
	        d.setRightSideBaseboard(this.rightSideBaseboard);
	        d.setHeight(this.parseOptionalFloat(f, "height"));
	        d.setHeightAtEnd(this.parseOptionalFloat(f, "heightAtEnd"));
	        d.setArcExtent(this.parseOptionalFloat(f, "arcExtent"));
	        d.setTopColor(this.parseOptionalColor(f, "topColor"));
	        d.setLeftSideColor(this.parseOptionalColor(f, "leftSideColor"));
	        d.setLeftSideTexture((function(j, l) {
	            return j[l] ? j[l] : null
	        })(this.textures, "leftSideTexture"));
	        var e = this.parseOptionalFloat(f, "leftSideShininess");
	        if (e != null) {
	            d.setLeftSideShininess(e)
	        }
	        d.setRightSideColor(this.parseOptionalColor(f, "rightSideColor"));
	        d.setRightSideTexture((function(j, l) {
	            return j[l] ? j[l] : null
	        })(this.textures, "rightSideTexture"));
	        var i = this.parseOptionalFloat(f, "rightSideShininess");
	        if (i != null) {
	            d.setRightSideShininess(i)
	        }
	        var h = (function(j, l) {
	            return j[l] ? j[l] : null
	        })(f, "pattern");
	        if (h != null) {
	            try {
	                d.setPattern(this.preferences.getPatternsCatalog().getPattern$java_lang_String(h))
	            } catch (g) {}
	        }
	    };
	    a.prototype.createRoom = function(c, d) {
	        return new Room(d)
	    };
	    a.prototype.setRoomAttributes = function(c, m, f) {
	        this.setProperties(c);
	        c.setNameStyle((function(n, o) {
	            return n[o] ? n[o] : null
	        })(this.textStyles, "nameStyle"));
	        c.setAreaStyle((function(n, o) {
	            return n[o] ? n[o] : null
	        })(this.textStyles, "areaStyle"));
	        c.setName((function(n, o) {
	            return n[o] ? n[o] : null
	        })(f, "name"));
	        var e = this.parseOptionalFloat(f, "nameAngle");
	        if (e != null) {
	            c.setNameAngle(e)
	        }
	        var d = this.parseOptionalFloat(f, "nameXOffset");
	        if (d != null) {
	            c.setNameXOffset(d)
	        }
	        var j = this.parseOptionalFloat(f, "nameYOffset");
	        if (j != null) {
	            c.setNameYOffset(j)
	        }
	        c.setAreaVisible((function(o, n) {
	            if (o && o.equals) {
	                return o.equals(n)
	            } else {
	                return o === n
	            }
	        })("true", (function(n, o) {
	            return n[o] ? n[o] : null
	        })(f, "areaVisible")));
	        var k = this.parseOptionalFloat(f, "areaAngle");
	        if (k != null) {
	            c.setAreaAngle(k)
	        }
	        var l = this.parseOptionalFloat(f, "areaXOffset");
	        if (l != null) {
	            c.setAreaXOffset(l)
	        }
	        var g = this.parseOptionalFloat(f, "areaYOffset");
	        if (g != null) {
	            c.setAreaYOffset(g)
	        }
	        c.setFloorVisible(!(function(o, n) {
	            if (o && o.equals) {
	                return o.equals(n)
	            } else {
	                return o === n
	            }
	        })("false", (function(n, o) {
	            return n[o] ? n[o] : null
	        })(f, "floorVisible")));
	        c.setFloorColor(this.parseOptionalColor(f, "floorColor"));
	        c.setFloorTexture((function(n, o) {
	            return n[o] ? n[o] : null
	        })(this.textures, "floorTexture"));
	        var h = this.parseOptionalFloat(f, "floorShininess");
	        if (h != null) {
	            c.setFloorShininess(h)
	        }
	        c.setCeilingVisible(!(function(o, n) {
	            if (o && o.equals) {
	                return o.equals(n)
	            } else {
	                return o === n
	            }
	        })("false", (function(n, o) {
	            return n[o] ? n[o] : null
	        })(f, "ceilingVisible")));
	        c.setCeilingColor(this.parseOptionalColor(f, "ceilingColor"));
	        c.setCeilingTexture((function(n, o) {
	            return n[o] ? n[o] : null
	        })(this.textures, "ceilingTexture"));
	        var i = this.parseOptionalFloat(f, "ceilingShininess");
	        if (i != null) {
	            c.setCeilingShininess(i)
	        }
	    };
	    a.prototype.createPolyline = function(c, d) {
	        return new Polyline(d)
	    };
	    a.prototype.setPolylineAttributes = function(j, m, e) {
	        this.setProperties(j);
	        var i = this.parseOptionalFloat(e, "thickness");
	        if (i != null) {
	            j.setThickness(i)
	        }
	        var k = (function(n, o) {
	            return n[o] ? n[o] : null
	        })(e, "capStyle");
	        if (k != null) {
	            try {
	                j.setCapStyle(Polyline.CapStyle[k])
	            } catch (h) {}
	        }
	        var f = (function(n, o) {
	            return n[o] ? n[o] : null
	        })(e, "joinStyle");
	        if (f != null) {
	            try {
	                j.setJoinStyle(Polyline.JoinStyle[f])
	            } catch (h) {}
	        }
	        var l = (function(n, o) {
	            return n[o] ? n[o] : null
	        })(e, "dashStyle");
	        if (l != null) {
	            try {
	                j.setDashStyle(Polyline.DashStyle[l])
	            } catch (h) {}
	        }
	        var g = (function(n, o) {
	            return n[o] ? n[o] : null
	        })(e, "startArrowStyle");
	        if (g != null) {
	            try {
	                j.setStartArrowStyle(Polyline.ArrowStyle[g])
	            } catch (h) {}
	        }
	        var c = (function(n, o) {
	            return n[o] ? n[o] : null
	        })(e, "endArrowStyle");
	        if (c != null) {
	            try {
	                j.setEndArrowStyle(Polyline.ArrowStyle[c])
	            } catch (h) {}
	        }
	        var d = this.parseOptionalColor(e, "color");
	        if (d != null) {
	            j.setColor(d)
	        }
	        j.setClosedPath((function(o, n) {
	            if (o && o.equals) {
	                return o.equals(n)
	            } else {
	                return o === n
	            }
	        })("true", (function(n, o) {
	            return n[o] ? n[o] : null
	        })(e, "closedPath")))
	    };
	    a.prototype.createDimensionLine = function(c) {
	        return new DimensionLine(this.parseFloat(c, "xStart"), this.parseFloat(c, "yStart"), this.parseFloat(c, "xEnd"), this.parseFloat(c, "yEnd"), this.parseFloat(c, "offset"))
	    };
	    a.prototype.setDimensionLineAttributes = function(d, c, e) {
	        this.setProperties(d);
	        d.setLengthStyle((function(f, g) {
	            return f[g] ? f[g] : null
	        })(this.textStyles, "lengthStyle"))
	    };
	    a.prototype.createLabel = function(c, d) {
	        return new Label(d, this.parseFloat(c, "x"), this.parseFloat(c, "y"))
	    };
	    a.prototype.setLabelAttributes = function(e, c, d) {
	        this.setProperties(e);
	        e.setStyle((function(i, j) {
	            return i[j] ? i[j] : null
	        })(this.textStyles, a.UNIQUE_ATTRIBUTE));
	        var h = this.parseOptionalFloat(d, "angle");
	        if (h != null) {
	            e.setAngle(h)
	        }
	        var f = this.parseOptionalFloat(d, "elevation");
	        if (f != null) {
	            e.setElevation(f)
	        }
	        var g = this.parseOptionalFloat(d, "pitch");
	        if (g != null) {
	            e.setPitch(g)
	        }
	        e.setColor(this.parseOptionalColor(d, "color"));
	        e.setOutlineColor(this.parseOptionalColor(d, "outlineColor"))
	    };
	    a.prototype.createBaseboard = function(c) {
	        return Baseboard.getInstance(this.parseFloat(c, "thickness"), this.parseFloat(c, "height"), this.parseOptionalColor(c, "color"), (function(d, e) {
	            return d[e] ? d[e] : null
	        })(this.textures, a.UNIQUE_ATTRIBUTE))
	    };
	    a.prototype.createTextStyle = function(c) {
	        return new TextStyle((function(d, e) {
	            return d[e] ? d[e] : null
	        })(c, "fontName"), this.parseFloat(c, "fontSize"), (function(e, d) {
	            if (e && e.equals) {
	                return e.equals(d)
	            } else {
	                return e === d
	            }
	        })("true", (function(d, e) {
	            return d[e] ? d[e] : null
	        })(c, "bold")), (function(e, d) {
	            if (e && e.equals) {
	                return e.equals(d)
	            } else {
	                return e === d
	            }
	        })("true", (function(d, e) {
	            return d[e] ? d[e] : null
	        })(c, "italic")))
	    };
	    a.prototype.createTexture = function(c) {
	        var d = (function(e, f) {
	            return e[f] ? e[f] : null
	        })(c, "catalogId");
	        return new HomeTexture(new CatalogTexture(d, (function(e, f) {
	            return e[f] ? e[f] : null
	        })(c, "name"), this.parseContent((function(e, f) {
	            return e[f] ? e[f] : null
	        })(c, "image"), d), this.parseFloat(c, "width"), this.parseFloat(c, "height"), (function(e, f) {
	            return e[f] ? e[f] : null
	        })(c, "creator")), (function(e, f) {
	            return e[f] ? e[f] : null
	        })(c, "angle") != null ? this.parseFloat(c, "angle") : 0, (function(e, f) {
	            return e[f] ? e[f] : null
	        })(c, "scale") != null ? this.parseFloat(c, "scale") : 1, !(function(f, e) {
	            if (f && f.equals) {
	                return f.equals(e)
	            } else {
	                return f === e
	            }
	        })("false", (function(e, f) {
	            return e[f] ? e[f] : null
	        })(c, "leftToRightOriented")))
	    };
	    a.prototype.createMaterial = function(c) {
	        return new HomeMaterial((function(d, e) {
	            return d[e] ? d[e] : null
	        })(c, "name"), (function(d, e) {
	            return d[e] ? d[e] : null
	        })(c, "key"), this.parseOptionalColor(c, "color"), this.materialTexture, this.parseOptionalFloat(c, "shininess"))
	    };
	    a.prototype.setProperties = function(d) {
	        var c = (function(i) {
	            var g = [];
	            for (var h in i) {
	                g.push({
	                    k: h,
	                    v: i[h],
	                    getKey: function() {
	                        return this.k
	                    },
	                    getValue: function() {
	                        return this.v
	                    }
	                })
	            }
	            return g
	        })(this.properties);
	        for (var e = 0; e < c.length; e++) {
	            var f = c[e];
	            d.setProperty(f.getKey(), f.getValue())
	        }
	    };
	    a.prototype.parseOptionalColor = function(d, e) {
	        var c = (function(g, h) {
	            return g[h] ? g[h] : null
	        })(d, e);
	        if (c != null) {
	            try {
	                return (parseInt(c, 16) | 0)
	            } catch (f) {
	                throw new SAXException("Invalid value for color attribute " + e, f)
	            }
	        } else {
	            return null
	        }
	    };
	    a.prototype.parseOptionalInteger = function(c, d) {
	        var f = (function(g, h) {
	            return g[h] ? g[h] : null
	        })(c, d);
	        if (f != null) {
	            try {
	                return parseInt(f)
	            } catch (e) {
	                throw new SAXException("Invalid value for integer attribute " + d, e)
	            }
	        } else {
	            return null
	        }
	    };
	    a.prototype.parseOptionalLong = function(c, d) {
	        var f = (function(g, h) {
	            return g[h] ? g[h] : null
	        })(c, d);
	        if (f != null) {
	            try {
	                return parseInt(f)
	            } catch (e) {
	                throw new SAXException("Invalid value for long attribute " + d, e)
	            }
	        } else {
	            return null
	        }
	    };
	    a.prototype.parseOptionalDecimal = function(c, d) {
	        var f = (function(g, h) {
	            return g[h] ? g[h] : null
	        })(c, d);
	        if (f != null) {
	            try {
	                return new Big(f)
	            } catch (e) {
	                throw new SAXException("Invalid value for decimal attribute " + d, e)
	            }
	        } else {
	            return null
	        }
	    };
	    a.prototype.parseOptionalFloat = function(c, d) {
	        var f = (function(g, h) {
	            return g[h] ? g[h] : null
	        })(c, d);
	        if (f != null) {
	            try {
	                return parseFloat(f)
	            } catch (e) {
	                throw new SAXException("Invalid value for float attribute " + d, e)
	            }
	        } else {
	            return null
	        }
	    };
	    a.prototype.parseFloat = function(c, d) {
	        var f = (function(g, h) {
	            return g[h] ? g[h] : null
	        })(c, d);
	        if (f != null) {
	            try {
	                return parseFloat(f)
	            } catch (e) {
	                throw new SAXException("Invalid value for float attribute " + d, e)
	            }
	        } else {
	            throw new SAXException("Missing float attribute " + d)
	        }
	    };
	    a.prototype.parseContent = function(c, d) {
	        if (c == null) {
	            return null
	        } else {
	            if (c.indexOf("://") >= 0) {
	                return new URLContent(c)
	            } else {
	                return new HomeURLContent("jar:" + this["homeUrl"] + "!/" + c)
	            }
	        }
	    };
	    a.prototype.setHome = function(c) {
	        this.home = c;
	        this.homeElementName = (function(d) {
	            return d[d.length - 1]
	        })(this.elements)
	    };
	    a.prototype.getHome = function() {
	        return this.home
	    };
	    return a
	}(DefaultHandler));
	
	function UserPreferences() {
	    this.propertyChangeSupport = new PropertyChangeSupport(this);
	    this.supportedLanguages = UserPreferences.DEFAULT_SUPPORTED_LANGUAGES;
	    this.defaultCountry = navigator.language.substring(navigator.language.indexOf("_") + 1, navigator.language.length);
	    var c = navigator.language.substring(0, navigator.language.indexOf("_"));
	    for (var a = 0; a < this.supportedLanguages; a++) {
	        var b = this.supportedLanguages[a];
	        if (b == c + "_" + this.defaultCountry) {
	            this.language = b;
	            break
	        } else {
	            if (this.language === null && b.indexOf(c) === 0) {
	                this.language = b
	            }
	        }
	    }
	    if (this.language === null) {
	        this.language = "en"
	    }
	    this.resourceBundles = {};
	    this.furnitureCatalog = null;
	    this.texturesCatalog = null;
	    this.patternsCatalog = null;
	    this.currency = null;
	    this.unit = null;
	    this.furnitureCatalogViewedInTree = true;
	    this.aerialViewCenteredOnSelectionEnabled = false;
	    this.observerCameraSelectedAtChange = true;
	    this.navigationPanelVisible = true;
	    this.magnetismEnabled = true;
	    this.rulersVisible = true;
	    this.gridVisible = true;
	    this.defaultFontName = null;
	    this.furnitureViewedFromTop = true;
	    this.furnitureModelIconSize = 128;
	    this.roomFloorColoredOrTextured = true;
	    this.wallPattern = null;
	    this.newWallPattern = null;
	    this.newWallThickness = 7.5;
	    this.newWallHeight = 250;
	    this.newWallBaseboardThickness = 1;
	    this.newWallBaseboardHeight = 7;
	    this.newFloorThickness = 12;
	    this.recentHomes = [];
	    this.autoSaveDelayForRecovery;
	    this.autoCompletionStrings = {};
	    this.recentColors = [];
	    this.recentTextures = [];
	    this.homeExamples = []
	}
	UserPreferences.DEFAULT_SUPPORTED_LANGUAGES = ["en"];
	UserPreferences.DEFAULT_TEXT_STYLE = new TextStyle(18);
	UserPreferences.DEFAULT_ROOM_TEXT_STYLE = new TextStyle(24);
	UserPreferences.prototype.addPropertyChangeListener = function(b, a) {
	    this.propertyChangeSupport.addPropertyChangeListener(b, a)
	};
	UserPreferences.prototype.removePropertyChangeListener = function(b, a) {
	    this.propertyChangeSupport.removePropertyChangeListener(b, a)
	};
	UserPreferences.prototype.getFurnitureCatalog = function() {
	    return this.furnitureCatalog
	};
	UserPreferences.prototype.setFurnitureCatalog = function(a) {
	    this.furnitureCatalog = a
	};
	UserPreferences.prototype.getTexturesCatalog = function() {
	    return this.texturesCatalog
	};
	UserPreferences.prototype.setTexturesCatalog = function(a) {
	    this.texturesCatalog = a
	};
	UserPreferences.prototype.getPatternsCatalog = function() {
	    return this.patternsCatalog
	};
	UserPreferences.prototype.setPatternsCatalog = function(a) {
	    this.patternsCatalog = a
	};
	UserPreferences.prototype.getLengthUnit = function() {
	    return this.unit
	};
	UserPreferences.prototype.setUnit = function(a) {
	    if (this.unit !== a) {
	        var b = this.unit;
	        this.unit = a;
	        this.propertyChangeSupport.firePropertyChange("UNIT", b, a)
	    }
	};
	UserPreferences.prototype.getLanguage = function() {
	    return this.language
	};
	UserPreferences.prototype.setLanguage = function(b) {
	    if (b != this.language && this.isLanguageEditable()) {
	        var a = this.language;
	        this.language = b;
	        this.propertyChangeSupport.firePropertyChange("LANGUAGE", a, b)
	    }
	};
	UserPreferences.prototype.isLanguageEditable = function() {
	    return true
	};
	UserPreferences.prototype.getDefaultSupportedLanguages = function() {
	    return UserPreferences.DEFAULT_SUPPORTED_LANGUAGES.slice(0)
	};
	UserPreferences.prototype.getSupportedLanguages = function() {
	    return this.supportedLanguages.slice(0)
	};
	UserPreferences.prototype.setSupportedLanguages = function(a) {
	    if (this.supportedLanguages != a) {
	        var b = this.supportedLanguages;
	        this.supportedLanguages = a.slice(0);
	        this.propertyChangeSupport.firePropertyChange("SUPPORTED_LANGUAGES", b, a)
	    }
	};
	UserPreferences.prototype.getLocalizedString = function(c, j, i) {
	    throw new UnsupportedOperationException("Not implemented yet");
	    if (typeof c !== "string") {
	        var e = this.classResourceBundles[c];
	        if (e === null) {
	            try {
	                e = this.getResourceBundle(c.constructor.name);
	                this.classResourceBundles[c.constructor.name] = e
	            } catch (h) {
	                try {
	                    var g = c.constructor.name;
	                    var d = g.lastIndexOf(".");
	                    var f;
	                    if (d !== -1) {
	                        f = g.substring(0, d) + ".package"
	                    } else {
	                        f = "package"
	                    }
	                    e = new PrefixedResourceBundle(getResourceBundle(f), c.constructor.name + ".");
	                    this.classResourceBundles[c.constructor.name] = e
	                } catch (a) {
	                    throw new IllegalArgumentException("Can't find resource bundle for " + c, h)
	                }
	            }
	        }
	        return this.getBundleLocalizedString(e, j, i)
	    } else {
	        var f = c;
	        try {
	            var b = this.getResourceBundle(f);
	            return this.getBundleLocalizedString(b, j, i)
	        } catch (h) {
	            throw new IllegalArgumentException("Can't find resource bundle for " + f, h)
	        }
	    }
	};
	UserPreferences.prototype.getResourceBundle = function(h) {
	    h = h.replace(".", "/");
	    var b = this.resourceBundles.get(h);
	    if (b !== null) {
	        return b
	    }
	    var p = this.language;
	    var e = p.getLanguage();
	    var c = p.getCountry();
	    var o = [".properties", "_" + e + ".properties", "_" + e + "_" + c + ".properties"];
	    for (var f = 0; f < o.length; f++) {
	        var n = o[f];
	        var g = this.getResourceClassLoaders();
	        for (var d = 0; d < g.length; d++) {
	            var a = g[d];
	            var m = a.getResourceAsStream(h + n);
	            if (m !== null) {
	                var k = b;
	                try {
	                    b = new PropertyResourceBundle(m);
	                    b.setParent(k);
	                    break
	                } catch (l) {
	                    l.printStackTrace()
	                } finally {
	                    m.close()
	                }
	            }
	        }
	    }
	    if (b === null) {
	        throw new IOException("No available resource bundle for " + h)
	    }
	    this.resourceBundles.put(h, b);
	    return b
	};
	UserPreferences.prototype.getBundleLocalizedString = function(d, c, e) {
	    try {
	        var a = d.getString(c);
	        if (e.length > 0) {
	            a = String.format(a, e)
	        }
	        return a
	    } catch (b) {
	        throw new IllegalArgumentException("Unknown key " + c)
	    }
	};
	UserPreferences.prototype.getResourceClassLoaders = function() {
	    throw new UnsupportedOperationException("Not implemented yet");
	    return DEFAULT_CLASS_LOADER
	};
	UserPreferences.prototype.getCurrency = function() {
	    return this.currency
	};
	UserPreferences.prototype.setCurrency = function(a) {
	    this.currency = a
	};
	UserPreferences.prototype.isFurnitureCatalogViewedInTree = function() {
	    return this.furnitureCatalogViewedInTree
	};
	UserPreferences.prototype.setFurnitureCatalogViewedInTree = function(a) {
	    if (this.furnitureCatalogViewedInTree !== a) {
	        this.furnitureCatalogViewedInTree = a;
	        this.propertyChangeSupport.firePropertyChange("FURNITURE_CATALOG_VIEWED_IN_TREE", !a, a)
	    }
	};
	UserPreferences.prototype.isNavigationPanelVisible = function() {
	    return this.navigationPanelVisible
	};
	UserPreferences.prototype.setNavigationPanelVisible = function(a) {
	    if (this.navigationPanelVisible !== a) {
	        this.navigationPanelVisible = a;
	        this.propertyChangeSupport.firePropertyChange("NAVIGATION_PANEL_VISIBLE", !a, a)
	    }
	};
	UserPreferences.prototype.setAerialViewCenteredOnSelectionEnabled = function(a) {
	    if (a !== this.aerialViewCenteredOnSelectionEnabled) {
	        this.aerialViewCenteredOnSelectionEnabled = a;
	        this.propertyChangeSupport.firePropertyChange("AERIAL_VIEW_CENTERED_ON_SELECTION_ENABLED", !a, a)
	    }
	};
	UserPreferences.prototype.isAerialViewCenteredOnSelectionEnabled = function() {
	    return this.aerialViewCenteredOnSelectionEnabled
	};
	UserPreferences.prototype.setObserverCameraSelectedAtChange = function(a) {
	    if (a !== this.observerCameraSelectedAtChange) {
	        this.observerCameraSelectedAtChange = a;
	        this.propertyChangeSupport.firePropertyChange("OBSERVER_CAMERA_SELECTED_AT_CHANGE", !a, a)
	    }
	};
	UserPreferences.prototype.isObserverCameraSelectedAtChange = function() {
	    return this.observerCameraSelectedAtChange
	};
	UserPreferences.prototype.isMagnetismEnabled = function() {
	    return this.magnetismEnabled
	};
	UserPreferences.prototype.setMagnetismEnabled = function(a) {
	    if (this.magnetismEnabled !== a) {
	        this.magnetismEnabled = a;
	        this.propertyChangeSupport.firePropertyChange("MAGNETISM_ENABLED", !a, a)
	    }
	};
	UserPreferences.prototype.isRulersVisible = function() {
	    return this.rulersVisible
	};
	UserPreferences.prototype.setRulersVisible = function(a) {
	    if (this.rulersVisible !== a) {
	        this.rulersVisible = a;
	        this.propertyChangeSupport.firePropertyChange("RULERS_VISIBLE", !a, a)
	    }
	};
	UserPreferences.prototype.isGridVisible = function() {
	    return this.gridVisible
	};
	UserPreferences.prototype.setGridVisible = function(a) {
	    if (this.gridVisible !== a) {
	        this.gridVisible = a;
	        this.propertyChangeSupport.firePropertyChange("GRID_VISIBLE", !a, a)
	    }
	};
	UserPreferences.prototype.getDefaultFontName = function() {
	    return this.defaultFontName
	};
	UserPreferences.prototype.setDefaultFontName = function(b) {
	    if (b != this.defaultFontName) {
	        var a = this.defaultFontName;
	        this.defaultFontName = b;
	        this.propertyChangeSupport.firePropertyChange("DEFAULT_FONT_NAME", a, b)
	    }
	};
	UserPreferences.prototype.isFurnitureViewedFromTop = function() {
	    return this.furnitureViewedFromTop
	};
	UserPreferences.prototype.setFurnitureViewedFromTop = function(a) {
	    if (this.furnitureViewedFromTop !== a) {
	        this.furnitureViewedFromTop = a;
	        this.propertyChangeSupport.firePropertyChange("FURNITURE_VIEWED_FROM_TOP", !a, a)
	    }
	};
	UserPreferences.prototype.getFurnitureModelIconSize = function() {
	    return this.furnitureModelIconSize
	};
	UserPreferences.prototype.setFurnitureModelIconSize = function(a) {
	    if (a !== this.furnitureModelIconSize) {
	        var b = this.furnitureModelIconSize;
	        this.furnitureModelIconSize = a;
	        this.propertyChangeSupport.firePropertyChange("FURNITURE_MODEL_ICON_SIZE", b, a)
	    }
	};
	UserPreferences.prototype.isRoomFloorColoredOrTextured = function() {
	    return this.roomFloorColoredOrTextured
	};
	UserPreferences.prototype.setFloorColoredOrTextured = function(a) {
	    if (this.roomFloorColoredOrTextured !== a) {
	        this.roomFloorColoredOrTextured = a;
	        this.propertyChangeSupport.firePropertyChange("ROOM_FLOOR_COLORED_OR_TEXTURED", !a, a)
	    }
	};
	UserPreferences.prototype.getWallPattern = function() {
	    return this.wallPattern
	};
	UserPreferences.prototype.setWallPattern = function(a) {
	    if (this.wallPattern !== a) {
	        var b = this.wallPattern;
	        this.wallPattern = a;
	        this.propertyChangeSupport.firePropertyChange("WALL_PATTERN", b, a)
	    }
	};
	UserPreferences.prototype.getNewWallPattern = function() {
	    return this.newWallPattern
	};
	UserPreferences.prototype.setNewWallPattern = function(a) {
	    if (this.newWallPattern !== a) {
	        var b = this.newWallPattern;
	        this.newWallPattern = a;
	        this.propertyChangeSupport.firePropertyChange("NEW_WALL_PATTERN", b, a)
	    }
	};
	UserPreferences.prototype.getNewWallThickness = function() {
	    return this.newWallThickness
	};
	UserPreferences.prototype.setNewWallThickness = function(b) {
	    if (this.newWallThickness !== b) {
	        var a = this.newWallThickness;
	        this.newWallThickness = b;
	        this.propertyChangeSupport.firePropertyChange("NEW_WALL_THICKNESS", a, b)
	    }
	};
	UserPreferences.prototype.getNewWallHeight = function() {
	    return this.newWallHeight
	};
	UserPreferences.prototype.setNewWallHeight = function(a) {
	    if (this.newWallHeight !== a) {
	        var b = this.newWallHeight;
	        this.newWallHeight = a;
	        this.propertyChangeSupport.firePropertyChange("NEW_WALL_HEIGHT", b, a)
	    }
	};
	UserPreferences.prototype.getNewWallBaseboardThickness = function() {
	    return this.newWallBaseboardThickness
	};
	UserPreferences.prototype.setNewWallBaseboardThickness = function(b) {
	    if (this.newWallBaseboardThickness !== b) {
	        var a = this.newWallBaseboardThickness;
	        this.newWallBaseboardThickness = b;
	        this.propertyChangeSupport.firePropertyChange("NEW_WALL_SIDEBOARD_THICKNESS", a, b)
	    }
	};
	UserPreferences.prototype.getNewWallBaseboardHeight = function() {
	    return this.newWallBaseboardHeight
	};
	UserPreferences.prototype.setNewWallBaseboardHeight = function(a) {
	    if (this.newWallBaseboardHeight !== a) {
	        var b = this.newWallBaseboardHeight;
	        this.newWallBaseboardHeight = a;
	        this.propertyChangeSupport.firePropertyChange("NEW_WALL_SIDEBOARD_HEIGHT", b, a)
	    }
	};
	UserPreferences.prototype.getNewFloorThickness = function() {
	    return this.newFloorThickness
	};
	UserPreferences.prototype.setNewFloorThickness = function(a) {
	    if (this.newFloorThickness !== a) {
	        var b = this.newFloorThickness;
	        this.newFloorThickness = a;
	        this.propertyChangeSupport.firePropertyChange("NEW_FLOOR_THICKNESS", b, a)
	    }
	};
	UserPreferences.prototype.getAutoSaveDelayForRecovery = function() {
	    return this.autoSaveDelayForRecovery
	};
	UserPreferences.prototype.setAutoSaveDelayForRecovery = function(b) {
	    if (this.autoSaveDelayForRecovery !== b) {
	        var a = this.autoSaveDelayForRecovery;
	        this.autoSaveDelayForRecovery = b;
	        this.propertyChangeSupport.firePropertyChange("AUTO_SAVE_DELAY_FOR_RECOVERY", a, b)
	    }
	};
	UserPreferences.prototype.getRecentHomes = function() {
	    return Collections.unmodifiableList(this.recentHomes)
	};
	UserPreferences.prototype.setRecentHomes = function(b) {
	    if (b != this.recentHomes) {
	        var a = this.recentHomes;
	        this.recentHomes = new ArrayList < String > (b);
	        this.propertyChangeSupport.firePropertyChange("RECENT_HOMES", a, this.getRecentHomes())
	    }
	};
	UserPreferences.prototype.getRecentHomesMaxCount = function() {
	    return 10
	};
	UserPreferences.prototype.getStoredCamerasMaxCount = function() {
	    return 50
	};
	UserPreferences.prototype.setActionTipIgnored = function(a) {
	    this.propertyChangeSupport.firePropertyChange("IGNORED_ACTION_TIP", null, a)
	};
	UserPreferences.prototype.isActionTipIgnored = function(a) {
	    return true
	};
	UserPreferences.prototype.resetIgnoredActionTips = function() {
	    this.propertyChangeSupport.firePropertyChange("IGNORED_ACTION_TIP", null, null)
	};
	UserPreferences.prototype.getDefaultTextStyle = function(a) {
	    if (a.name == "Room") {
	        return UserPreferences.DEFAULT_ROOM_TEXT_STYLE
	    } else {
	        return UserPreferences.DEFAULT_TEXT_STYLE
	    }
	};
	UserPreferences.prototype.getAutoCompletionStrings = function(b) {
	    var a = this.autoCompletionStrings.get(b);
	    if (a !== null) {
	        return Collections.unmodifiableList(a)
	    } else {
	        return []
	    }
	};
	UserPreferences.prototype.addAutoCompletionString = function(c, b) {
	    if (b !== null && b.length() > 0) {
	        var a = this.autoCompletionStrings[c];
	        if (a === undefined) {
	            a = []
	        } else {
	            if (!a.contains(b)) {
	                a = new ArrayList < String > (a)
	            } else {
	                return
	            }
	        }
	        a.splice(0, 0, b);
	        this.setAutoCompletionStrings(c, a)
	    }
	};
	UserPreferences.prototype.setAutoCompletionStrings = function(b, c) {
	    var a = this.autoCompletionStrings[b];
	    if (c != a) {
	        this.autoCompletionStrings.put(b, c.slice(0));
	        this.propertyChangeSupport.firePropertyChange("AUTO_COMPLETION_STRINGS", null, b)
	    }
	};
	UserPreferences.prototype.getAutoCompletedProperties = function() {
	    if (this.autoCompletionStrings !== null) {
	        return Object.keys(this.autoCompletionStrings)
	    } else {
	        return Collections.emptyList()
	    }
	};
	UserPreferences.prototype.getRecentColors = function() {
	    return this.recentColors
	};
	UserPreferences.prototype.setRecentColors = function(a) {
	    if (a != this.recentColors) {
	        var b = this.recentColors;
	        this.recentColors = a.slice(0);
	        this.propertyChangeSupport.firePropertyChange("RECENT_COLORS", b, this.getRecentColors())
	    }
	};
	UserPreferences.prototype.getRecentTextures = function() {
	    return this.recentTextures
	};
	UserPreferences.prototype.setRecentTextures = function(b) {
	    if (b != this.recentTextures) {
	        var a = this.recentTextures;
	        this.recentTextures = b.slice(0);
	        this.propertyChangeSupport.firePropertyChange("RECENT_TEXTURES", a, this.getRecentTextures())
	    }
	};
	UserPreferences.prototype.setHomeExamples = function(a) {
	    if (a != this.homeExamples) {
	        var b = this.homeExamples;
	        this.homeExamples = a.slice(0);
	        this.propertyChangeSupport.firePropertyChange("HOME_EXAMPLES", b, this.getHomeExamples())
	    }
	};
	UserPreferences.prototype.getHomeExamples = function() {
	    return this.homeExamples
	};

	function DefaultUserPreferences() {
	    UserPreferences.call(this);
	    this.setUnit(LengthUnit.CENTIMETER);
	    this.setNavigationPanelVisible(false)
	}
	DefaultUserPreferences.prototype = Object.create(UserPreferences.prototype);
	DefaultUserPreferences.prototype.constructor = DefaultUserPreferences;
