/**
 * @author : zhangsl
 * @date : 2012-6-14 上午9:00:25
 * @description:地图驱动类，完成投影，坐标系变换操作
 */
Ext.ns("cms.tool");
cms.tool.k = Ext.extend(Ext.util.Observable, {
	map : "",
	vectors : "",
	mapItems : "",
	thematicType : 0,
	ydc : 0,
	poflist : [],
	poflistdftm : [],
	gsshuzu : [],
	hyunlist : [],
	linests : [],
	linestsd : [],
	markerbsz:[],
	szPointb:[],
	ydc : 0,
	stime : '',
	etime : '',
	stx1 : '',
	stx2 : '',
	sty1 : '',
	sty2 : '',
	measureControllist : [],
	constructor : function(config) {
		// cms.tool.k.superclass.constructor.call(this, config);
	},
	getControl : function() {
		this.vpn = new cms.emap.ctrlpanel({
					listeners : {
						RectEvent : function() {
							if (that.poFeature != null) {
								for (var ir = 0; ir < that.poflist.length; ir++) {
									that.vector
											.removeFeatures(that.poflist[ir]);
								}
							}
							that.ms.deactivate();
						},
						RectEventdftm : function() {
							if (that.poFeature != null) {
								for (var ir = 0; ir < that.poflistdftm.length; ir++) {
									that.vector
											.removeFeatures(that.poflistdftm[ir]);
								}
							}
							that.ms.deactivate();
						},
						hyun : function(eventObject) {
							that.dehyun();
							that.hyun(eventObject.params.XPos,
									eventObject.params.YPos,
									eventObject.params.radius);
						},
						dehyun : function(eventObject) {
							that.dehyun();
							that.aqmarkers.removeMarker(that.marker);
							that.map.removeLayer(that.aqmarkers);
						}
					}
				});
		this.mp = new cms.emap.mappanel({
					listeners : {
						EmapEvent : this.onEmapEventHandler
								.createDelegate(this)
					}
				});
		this.cc = new cms.emap.ctrlClient({
					listeners : {
						ccRectEvent : function() {
							this.celrectHandler();
						}.createDelegate(this)
					}
				});
		this.bayonet = new cms.emap.bayonetsearch({});
		this.nav = new cms.emap.navigate({
					listeners : {
						dingwei : function(eventObject) {
							var op = that.vector.getFeaturesByAttribute('mesa',
									eventObject.params.elementId)[0];
							that.map.panTo(new OpenLayers.LonLat(op.geometry
											.getVertices()[0].x, op.geometry
											.getVertices()[0].y));
							if (that.popup != null) {
								that.popup.close();
							}
							that.createPopup(op)
						},
						huline : function(eventObject) {
							if (this.linests.length != 0) {
								if (this.popup != null) {
									this.popup.close();
								}
								this.vector.removeFeatures(this.linests);
								this.linests.length = 0;
							}
							this.huaxian(eventObject);
						}.createDelegate(this),
						gpsRD : function(eventObject) {
							that.startReplay(eventObject);
						},
						gpsRDC : function(eventObject) {
							if (this.lineFeature != null
									&& this.gdmarkers != null) {
								this.vector.removeFeatures(this.lineFeature);
								this.gdmarkers.removeMarker(this.marker);
							}
						}.createDelegate(this),
						npanTo2 : function(eventObject) {
							var op = that.vector.getFeaturesByAttribute(
									'nodelinkid',
									parseInt(eventObject.params.elemlinkid))[0];
							that.map.panTo(new OpenLayers.LonLat(op.geometry.x,
									op.geometry.y));
							if (that.popup != null) {
								that.popup.close();
							}
							that.createPopup(op)
						}
					}
				});
		this.nav.getControl();
		Ext.QuickTips.init();
		var mapOptions = {
			maxResolution : parseFloat(ezPort[5], 10),
			numZoomLevels : 6,
			projection : new OpenLayers.Projection('EPSG:4326'),
			maxExtent : new OpenLayers.Bounds(-180.0, -90.0, 180.0, 90.0),
			units : "degrees",
			controls : []
		};
		this.map = new OpenLayers.Map(mapOptions);
		var options = {
			maxResolution : parseFloat(ezPort[5], 10),
			numZoomLevels : 6
		};
		var graphic = new OpenLayers.Layer.Image('静态', jturl,
				new OpenLayers.Bounds(a1[0], a1[1], a1[2], a1[3]),
				new OpenLayers.Size(ezPort[4].split(",")[0], ezPort[4]
								.split(",")[1]), options);
		// this.map.addControl(new OpenLayers.Control.PanZoomBar({
		// position : new OpenLayers.Pixel(8, 15),
		// panIcons:false,
		// zoomWorldIcon : true
		// }));
		this.map.addControl(new OpenLayers.Control.Navigation());
		this.map.addControl(new OpenLayers.Control.PanPanel({
					position : new OpenLayers.Pixel(19, 35)
				}));
		this.map.addControl(new OpenLayers.Control.ZoomPanel({
					position : new OpenLayers.Pixel(35, 90)
				}));
		this.map.addControl(new OpenLayers.Control.ScaleLine({
			position : new OpenLayers.Pixel(8, document.body.clientHeight - 75),
			geodesic : true
		}));
		this.map.addControl(new OpenLayers.Control.LayerSwitcher({
					'ascending' : false,
					'roundedCornerColor' : '#6F94D2'
				}));

		this.map.addControl(new OpenLayers.Control.MousePosition({
			// element : $('location'),
			prefix : "坐标：",
			position : new OpenLayers.Pixel(6, document.body.clientHeight - 45),
			emptyString : '移动鼠标可获取坐标'
		}));
		this.busylayer = new OpenLayers.Layer.WMS("拥堵",
				"http://10.64.62.123:8015/geoserver/nimei/wms", {
					"LAYERS": 'nimei:GIS_L_CITYMAINROAD_POLYLINE',
					"format" : "image/png",
					"transparent" : "TRUE"
				});
		this.wms = new OpenLayers.Layer.WMS("矢量", ezMap, {
					layers : ezPort[0],
					isBaseLayer : true,
					tiled : true,
					format : 'image/png'
				}, {
					tileSize : new OpenLayers.Size(256, 256)
				});
		this.map.addControl(new OpenLayers.Control.OverviewMap({
					maximized : true,
					autoPan : true
				}));
		this.vector = new OpenLayers.Layer.Vector("数据");
		this.vector.div.oncontextmenu = function() {
			return false;
		}
		this.selectCtrl = new OpenLayers.Control.SelectFeature(this.vector, {
					onSelect : function(e) {
						if (that.popup != null) {
							that.popup.close();
						}
						that.createPopup(e);
						Ext.get('OpenLayers_Control_MaximizeDiv_innerImage')
								.on('click', function() {
											that.popup.close();
										});
					},
					onRightSelect : function(e) {
						var xy = that.map
								.getPixelFromLonLat(new OpenLayers.LonLat(
										e.geometry.x, e.geometry.y));
						that.mp.selectEl4RK = true;
						if (mapMode == 1) {
							that.mp.initContextMenu(e.attributes, e.geometry);
							that.mp.ctrlContextMenu(e.attributes);
							that.mp.contextmenu.showAt([xy.x, xy.y]);
						}
						that.selectCtrl.unselect(e);
					}
				});
		this.map.addControl(this.selectCtrl);
		this.selectCtrl.activate();
		this.map.events.on({
					click : function(e) {
						if (that.mp.contextmenu != null) {
							that.mp.contextmenu.hide();
						}
					},
					contextmenu : function(e) {
						var eg = that.map
								.getLonLatFromPixel(new OpenLayers.Pixel(
										e.clientX, e.clientY - 30));
						that.mp.selectEl4RK = false;
						that.mp.initContextMenu(e.attributes, eg);
						that.mp.ctrlContextMenu();
						that.mp.contextmenu.showAt([e.clientX, e.clientY]);
					}
				});
		// this.map.addControl(new OpenLayers.Control.EditingToolbar(vector));
		// this.map.addControl(new OpenLayers.Control.DragFeature(vector));
		// var markers = new OpenLayers.Layer.Markers("Markers");
		// // markers.isDrawn();
		// this.map.addLayer(markers);
		// var size = new OpenLayers.Size(21, 25);
		// var offset = new OpenLayers.Pixel(-(size.w / 2), -size.h);
		// var icon = new OpenLayers.Icon(
		// 'modules/its_map/hiklayers/openlayers/img/marker-blue.png',
		// size, offset);
		// markers.addMarker(new OpenLayers.Marker(new OpenLayers.LonLat(
		// 120.18877, 30.21572), icon));
		if (ezPort[4].split(",").length == 1) {
			this.map.addLayers([this.wms, this.vector]);
		} else {
			this.map.addLayers([graphic, this.vector]);
		}
		// this.layersld.setVisibility(false);
		// this.map
		// .zoomToExtent(new OpenLayers.Bounds(a1[0], a1[1], a1[2], a1[3]));
		var ctrl, toolbarItems = [], action, actions = {};

		this.mapItems = [{
			xtype : "gx_zoomslider",
			vertical : true,
			height : 250,
			x : 32,
			y : 115,
			plugins : new GeoExt.ZoomSliderTip({
						template : "<div>当前级别: {zoom}</div><div>比例尺: 1:{scale}</div>"
					})
		}];
		action = new GeoExt.Action({
			control : new OpenLayers.Control.ZoomToMaxExtent(),
			map : this.map,
			iconCls : 'og-fanwei',
			text : "全图展示"
				// tooltip : "全图展示"
			});
		actions["max_extent"] = action;
		// toolbarItems.push(action);
		// toolbarItems.push("-");

		action = new GeoExt.Action({
			text : "漫游",
			iconCls : 'og-tuodong',
			handler : function() {
				that.nmc.deactivate();
				that.nmb.deactivate();
				for (var i = 0; i < that.measureControllist.length; i++) {
					that.measureControllist[i].deactivate();
				}
			}
				// toggleGroup : "draw",
				// allowDepress : false,
				// pressed : true,
				// tooltip : "漫游"
				// group : "draw",
				// checked : true
			});
		actions["nav"] = action;
		toolbarItems.push(action);

		action = new GeoExt.Action({
					text : "测面积",
					control : this.createMeasureControl(
							OpenLayers.Handler.Polygon, "Measure area"),
					map : this.map,
					iconCls : 'og-mianji',
					toggleGroup : "draw",
					allowDepress : false,
					tooltip : "测面积",

					group : "draw"
				});
		actions["measure_poly"] = action;
		// toolbarItems.push(action);

		action = new GeoExt.Action({
					text : "测距离",
					iconCls : 'og-juli',
					control : this.createMeasureControl(
							OpenLayers.Handler.Path, "Measure length"),
					map : this.map,

					toggleGroup : "draw",
					allowDepress : false,
					tooltip : "测距离",

					group : "draw"
				});
		actions["measure_line"] = action;
		// toolbarItems.push(action);
		// toolbarItems.push("-");

		action = new GeoExt.Action({
			text : "选择",
			iconCls : 'og-xuanze',
			control : new OpenLayers.Control.DragFeature(this.vector, {
				onComplete : function(e) {
					var elObj = e.attributes;
					if (elObj) {
						if (elObj.styles.x == e.geometry.x
								&& elObj.styles.y == e.geometry.y)
							return;
						var shapeXml = '<Shape><ShapeType>Point</ShapeType><Point><X>'
								+ e.geometry.x
								+ '</X><Y>'
								+ e.geometry.y
								+ '</Y></Point></Shape>';
						that.elementId = e.attributes.nodeid;
						that.curX = e.geometry.x;
						that.curY = e.geometry.y;
						that.curElId = e.attributes.nodeid;
						Ext.Ajax.request({
							url : '/ezEmapInfoAction!changeElementShapeXml.action',
							success : that.updatePosSuccess
									.createDelegate(this),
							failure : that.updatePosFailure
									.createDelegate(this),
							params : {
								elementId : e.attributes.nodeid,
								latitude : e.geometry.y,
								longitude : e.geometry.x,
								shapeXml : shapeXml
							}
						});
					}
				}
			}),
			map : this.map,

			enableToggle : true
				// tooltip : "选择"
		});
		actions["select"] = action;
		if (mapMode == 1) {
			toolbarItems.push(action);
			toolbarItems.push("-");
		} else {
			toolbarItems.push("-");
		}
		this.nmb = new OpenLayers.Control.DrawFeature(this.vector,
				OpenLayers.Handler.Polygon)
		action = new GeoExt.Action({
					text : "画多边形",
					iconCls : 'og-duobianxing',
					control : this.nmb,
					map : this.map,

					toggleGroup : "draw",
					allowDepress : false,
					tooltip : "多边形",

					group : "draw"
				});
		actions["draw_poly"] = action;
		// toolbarItems.push(action);
		this.nmc = new OpenLayers.Control.DrawFeature(this.vector,
				OpenLayers.Handler.Path)
		action = new GeoExt.Action({
					text : "画线",
					iconCls : 'og-xian',
					control : this.nmc,
					map : this.map,
					toggleGroup : "draw",
					allowDepress : false,
					tooltip : "画线",

					group : "draw"
				});
		actions["draw_line"] = action;
		// toolbarItems.push(action);
		// toolbarItems.push("-");

		ctrl = new OpenLayers.Control.NavigationHistory();
		this.map.addControl(ctrl);

		action = new GeoExt.Action({
					text : "上一步",
					iconCls : 'og-shangbu',
					control : ctrl.previous,
					disabled : true,
					tooltip : "上一步"
				});
		actions["previous"] = action;
		// toolbarItems.push(action);

		action = new GeoExt.Action({
					text : "下一步",
					iconCls : 'og-xiabu',
					control : ctrl.next,
					disabled : true,
					tooltip : "下一步"
				});
		actions["next"] = action;
		// toolbarItems.push(action);
		// toolbarItems.push("-");
		that = this;
		action = new GeoExt.Action({
					text : "放大",
					iconCls : 'og-fangda',
					handler : function() {
						that.map.zoomIn();
					},
					tooltip : "放大"
				});
		actions["zoomIn"] = action;
		// toolbarItems.push(action);

		action = new GeoExt.Action({
					text : "缩小",
					iconCls : 'og-suoxiao',
					handler : function() {
						that.map.zoomOut();
					},
					tooltip : "缩小"
				});
		actions["zoomOut"] = action;
		// toolbarItems.push(action);

		// toolbarItems.push("-");
		action = new GeoExt.Action({
			text : "轨迹查询",
			iconCls : 'og-guiji',
			handler : this.gpsRoad.createDelegate(this)
				// tooltip : "轨迹查询"
			});
		actions["gpsRoad"] = action;
		if (mapMode == 0 && licParams.indexOf(50022) > 0) {
			toolbarItems.push(action);
			toolbarItems.push("-");
		}
		action = new GeoExt.Action({
			text : "多选操作",
			iconCls : 'og-duoxuan',
			handler : this.mulSelect.createDelegate(this, ["dftm"])
				// tooltip : "多选操作"
			});
		actions["mulselect"] = action;
		if (mapMode == 0) {
			toolbarItems.push(action);
			toolbarItems.push("-");
		}
		action = new GeoExt.Action({
			text : "区域碰撞",
			handler : this.quyuSelect.createDelegate(this),
			iconCls : 'og-quyu'
				// tooltip : "区域碰撞"
			});
		actions["quyuselect"] = action;
		if (mapMode == 0 && licParams.indexOf(50023) > 0) {
			toolbarItems.push(action);
			toolbarItems.push("-");
		}
		action = new GeoExt.Action({
			text : "组织机构",
			handler : this.zuzhijigou.createDelegate(this),
			iconCls : 'og-zuzhi'
				// tooltip : "组织机构"
			});
		actions["zuzhijigou"] = action;
		if (mapMode == 0) {
			toolbarItems.push(action);
			toolbarItems.push("-");
		}
		action = new GeoExt.Action({
			text : "空间查询",
			handler : this.kongjian.createDelegate(this),
			iconCls : 'og-kongjian'
				// tooltip : "组织机构"
			});
		actions["kongjian"] = action;
		if (mapMode == 0) {
			toolbarItems.push(action);
			toolbarItems.push("-");
		}
		action = new GeoExt.Action({
			text : "拥堵状态",
			handler : this.yongdu.createDelegate(this),
			iconCls : 'og-yongdu'
				// tooltip : "组织机构"
			});
		actions["yongdu"] = action;
		if (mapMode == 0) {
			toolbarItems.push(action);
			// toolbarItems.push("-");
		}
		action = new GeoExt.Action({
			text : "添加" + top.crossingManageName,
			iconCls : 'og-kakou',
			code : 'addBayonetBtn',
			handler : this.showAddNodeWindowHandler.createDelegate(this,
					[this.map.getCenter()], true)
				// tooltip : "添加卡口"
			});
		actions["addBay"] = action;
		if (mapMode == 1) {
			toolbarItems.push(action);
		}

		action = new GeoExt.Action({
			text : "添加监控点",
			iconCls : 'og-jiankongdian',
			code : 'addCameraBtn',
			handler : this.showAddNodeWindowHandler.createDelegate(this,
					[this.map.getCenter()], true)
				// tooltip : "添加监控点"
			});
		actions["addCam"] = action;
		if (mapMode == 1) {
			toolbarItems.push(action);
		}

		action = new GeoExt.Action({
			text : "添加车载",
			iconCls : 'og-chezai',
			code : 'addCarBtn',
			handler : this.showAddNodeWindowHandler.createDelegate(this,
					[this.map.getCenter()], true)
				// tooltip : "添加chezai"
			});
		actions["addCar"] = action;
		if (mapMode == 1) {
			// toolbarItems.push(action);
		}
		action = new GeoExt.Action({
			text : "添加单兵",
			iconCls : 'og-danbing',
			code : 'addSimpleBtn',
			handler : this.showAddNodeWindowHandler.createDelegate(this,
					[this.map.getCenter()], true)
				// tooltip : "添加chezai"
			});
		actions["addSimpleBtn"] = action;
		if (mapMode == 1) {
			// toolbarItems.push(action);
		}
		toolbarItems.push("->");
		toolbarItems.push({
					xtype : 'zhangsl',
					multi : true,
					fieldLabel : '查询',
					name : 'gisAutoSearch',
					anchor : '100%',
					listeners : {
						panTo2 : function(eventObject) {
							var op = that.vector.getFeaturesByAttribute(
									'nodeid', eventObject.params.elemid)[0];
							that.map.panTo(new OpenLayers.LonLat(op.geometry.x,
									op.geometry.y));
							if (that.popup != null) {
								that.popup.close();
							}
							that.createPopup(op)
						}
					}
				});
		toolbarItems.push("-");
		if (mapMode == 0) {
			toolbarItems.push({
				text : "工具",
				iconCls : 'og-gongju',
				menu : new Ext.menu.Menu({
							items : [
									/*
									 * actions["max_extent"], new
									 * Ext.menu.CheckItem(actions["nav"]),
									 */
									new Ext.menu.CheckItem(actions["draw_poly"]),
									new Ext.menu.CheckItem(actions["draw_line"]),
									new Ext.menu.CheckItem(actions["measure_poly"]),
									new Ext.menu.CheckItem(actions["measure_line"]),
									actions["previous"], actions["next"],
									actions["zoomIn"], actions["zoomOut"]]
						})
			});
			toolbarItems.push("-");
		}
		action = new GeoExt.Action({
			text : "全屏/退出",
			iconCls : 'og-quanping',
			code : 'fullScreen',
			id : 'fullScreen',
			handler : function() {
				if (mapMode == 0) {
					if (document.body.clientHeight == top.document.body.clientHeight
							- 89) {
						window.parent.document.getElementById("menu-bar").style.display = "none";
						if (ezPort[2].split(",")[2] == "2.3") {
							window.parent.document.getElementById("banner-bg").style.display = "none";
						} else if (ezPort[2].split(",")[2] == "2.4") {
							window.parent.document.getElementById("banner-bg").style.height = 0;
							window.parent.document.getElementById("banner_bg").style.display = "none";
						}
						parent.qpfa = 1;
						// window.parent.document.getElementById("divFrame").style.height=document.body.clientHeight+89;
						// window.open(document.location, 'big',
						// 'fullscreen=yes');
					} else {
						// window.parent.document.getElementById("divFrame").style.height=document.body.clientHeight-89;
						window.parent.document.getElementById("menu-bar").style.display = "";
						if (ezPort[2].split(",")[2] == "2.3") {
							window.parent.document.getElementById("banner-bg").style.display = "";
						} else if (ezPort[2].split(",")[2] == "2.4") {
							window.parent.document.getElementById("banner-bg").style.height = 55;
							window.parent.document.getElementById("banner_bg").style.display = "";
						}
						parent.qpfa = 0;
						// window.opener.location.href=window.opener.location.href
						// self.close();
					}
				} else if (mapMode == 1) {
					if (document.body.clientHeight == top.document.body.clientHeight
							- 89) {
						window.open(document.location, 'big', 'fullscreen=yes');
					} else {
						window.opener.location.href = window.opener.location.href
						self.close();
					}
				}
			}
				// tooltip : "全屏/退出"
		});
		actions["addCam"] = action;
		toolbarItems.push(action);
		this.mapPanel = new GeoExt.MapPanel({
					renderTo : "mappanel",
					height : document.body.clientHeight,
					width : '100%',
					map : this.map,
					items : this.mapItems,
					extent : new OpenLayers.Bounds(a1[0], a1[1], a1[2], a1[3]),
					// center : new OpenLayers.LonLat(ezPort[2]),
					// zoom : 2,
					tbar : toolbarItems,
					listeners : {
						afterrender : this.initMapEle.createDelegate(this)
					}
				});
		window.attachEvent("onresize", function() {
					var a = Ext.getDom("ext-gen40");
					var a1 = Ext.getDom("ext-gen37");
					var a6 = Ext.getDom("ext-gen39");
					var a2 = Ext.getDom("ext-comp-1090");
					var a7 = Ext.getDom("ext-comp-1081");
					var a3 = Ext.getDom("OpenLayers.Control.MousePosition_42");
					var a4 = Ext.getDom("OpenLayers.Control.ScaleLine_33");
					if (mapMode == 1) {
						var a5 = Ext.getDom("ext-comp-1079");
						a5.style.width = document.body.clientWidth;
						a3.style.top = document.body.clientHeight - 45;
						a4.style.top = document.body.clientHeight - 75;
						a6.style.width = document.body.clientWidth;
						a7.style.width = document.body.clientWidth;
					} else if (mapMode == 0) {
						a6.style.width = document.body.clientWidth;
						a2.style.width = document.body.clientWidth;
					}
					a.style.height = document.body.clientHeight - 30;
					a3.style.top = document.body.clientHeight - 45;
					a4.style.top = document.body.clientHeight - 75;
					if (that.gr != null && that.gr.isVisible()) {
						that.gr
								.setPosition(document.body.clientWidth - 242,
										37)
					}
					if (that.allPanel != null && that.allPanel.isVisible()) {
						that.allPanel.setPosition(document.body.clientWidth
										- 242, 37)
					}
					if (that.zjPanel != null && that.zjPanel.isVisible()) {
						that.zjPanel.setPosition(document.body.clientWidth
										- 242, 37)
					}
					if (that.dftmwin != null && that.dftmwin.isVisible()) {
						that.dftmwin.setPosition(document.body.clientWidth
										- 242, 37)
					}
					if (that.arwin != null && that.arwin.isVisible()) {
						that.arwin.setPosition(document.body.clientWidth - 242,
								37)
					}
					if (that.baywinc != null && that.baywinc.isVisible()) {
						that.baywinc.center()
					}
				});
	},
	createMeasureControl : function(handlerType, title) {
		this.styleMap = new OpenLayers.StyleMap({
					"default" : new OpenLayers.Style(null, {
								rules : [new OpenLayers.Rule({
											symbolizer : {
												"Point" : {
													pointRadius : 4,
													graphicName : "square",
													fillColor : "white",
													fillOpacity : 1,
													strokeWidth : 1,
													strokeOpacity : 1,
													strokeColor : "#333333"
												},
												"Line" : {
													strokeWidth : 3,
													strokeOpacity : 1,
													strokeColor : "#666666",
													strokeDashstyle : "dash"
												},
												"Polygon" : {
													strokeWidth : 2,
													strokeOpacity : 1,
													strokeColor : "#666666",
													fillColor : "white",
													fillOpacity : 0.3
												}
											}
										})]
							})
				});
		var cleanup = function() {
			if (measureToolTip) {
				measureToolTip.destroy();
			}
		};
		var makeString = function(metricData) {
			var metric = metricData.measure;
			var metricUnit = metricData.units;
			that.measureControl.displaySystem = "metric";
			var dim = metricData.order == 2 ? '<sup>2</sup>' : '';
			var pim = metricData.order == 2 ? '面积：' : '距离：';
			return "<font size='3'>" + pim + metric.toFixed(2) + " "
					+ metricUnit + dim + "</font>";
		};
		var measureToolTip;
		this.measureControl = new OpenLayers.Control.Measure(handlerType, {
					geodesic : true,
					persist : true,
					handlerOptions : {
						layerOptions : {
							styleMap : this.styleMap
						}
					},
					eventListeners : {
						measurepartial : function(event) {
							cleanup();
							// alert(measureControl.handler.lastUp.x)
							// ob=eval(event);
							// var Property="";
							// for(var i in ob){
							// alert(Property+="属性："+i);
							// }
							measureToolTip = new GeoExt.Popup({
										title : "测量数据",
										map : this.map,
										width : 200,
										// panIn:false,
										plain : true,
										hideBorders : true,
										shadow : false,
										closeAction : "hide",
										autoHeight : true,
										// bodyCssClass:'opacity',
										// ancCls:'opacity',
										anchored : true,
										closeAction : 'hide',
										unpinnable : false,
										html : makeString(event),
										collapsible : false
									});
							if (event.measure > 0) {
								if (event.order == 2) {
									var phpp = this.lonat(event);
									measureToolTip.location = new OpenLayers.LonLat(
											phpp[0], phpp[1]);
								} else {
									measureToolTip.location = new OpenLayers.LonLat(
											event.geometry.getVertices(true)[1].x,
											event.geometry.getVertices(true)[1].y);
								}
								measureToolTip.show();
							}
						},
						measure : function(event) {
							cleanup();
							measureToolTip = new GeoExt.Popup({
										title : "测量数据",
										map : this.map,
										width : 200,
										hideBorders : true,
										shadow : false,
										closeAction : "hide",
										autoHeight : true,
										plain : true,
										unpinnable : false,
										anchored : true,
										html : makeString(event),
										collapsible : false
									});
							if (event.measure > 0) {
								if (event.order == 2) {
									var phpp = this.lonat(event);
									measureToolTip.location = new OpenLayers.LonLat(
											phpp[0], phpp[1]);
								} else {
									measureToolTip.location = new OpenLayers.LonLat(
											event.geometry.getVertices(true)[1].x,
											event.geometry.getVertices(true)[1].y);
								}
								measureToolTip.show();
							}
						},
						deactivate : cleanup,
						scope : this
					}
				});
		this.measureControllist.push(this.measureControl);
		return this.measureControl;
	},
	showAddNodeWindowHandler : function(button, event, eg) {
		if (eg == null) {
			eg = this.map.getCenter();
		}
		var config = {};
		config.title = button.text;
		config.mapName = "sad";// this.controlItem.get('map').mapName;
		// var mapApp = this.controlItem.get('map').mapApp;
		switch (button.code) {
			case 'addCameraBtn' :
				config.treeType = 0;
				config.pos = {};
				config.pos.x = eg.lon;
				config.pos.y = eg.lat;
				config.po = {};
				config.po.x = eg.lon;
				config.po.y = eg.lat;
				break;
			case 'addIoInBtn' :
				config.treeType = 1;
				// config.pos = mapApp.getCenterLatLng();
				break;
			case 'addIoOutBtn' :
				config.treeType = 2;
				// config.pos = mapApp.getCenterLatLng();
				break;
			case 'addCarBtn' :
				config.treeType = 3;
				config.pos = {};
				config.pos.x = eg.lon;
				config.pos.y = eg.lat;
				config.po = {};
				config.po.x = eg.lon;
				config.po.y = eg.lat;
				break;
			case 'addSimpleBtn' :
				config.treeType = 4;
				config.pos = {};
				config.pos.x = eg.lon;
				config.pos.y = eg.lat;
				config.po = {};
				config.po.x = eg.lon;
				config.po.y = eg.lat;
				break;
			case 'addBayonetBtn' :
				config.treeType = 5;
				config.po = {};
				config.pos = {};
				config.po.x = eg.lon;
				config.po.y = eg.lat;
				config.pos.x = eg.lon;
				config.pos.y = eg.lat;
				break;
			case 'addCameraItem' :
				config.treeType = 0;
				config.pos = {};
				config.pos.x = eg.lon;
				config.pos.y = eg.lat;
				config.po = {};
				config.po.x = eg.lon;
				config.po.y = eg.lat;
				break;
			case 'addIoInItem' :
				config.treeType = 1;
				// config.pos = {};
				// config.pos.x = mapApp.getMouseMapX();
				// config.pos.y = mapApp.getMouseMapY();
				break;
			case 'addIoOutItem' :
				config.treeType = 2;
				// config.pos = {};
				// config.pos.x = mapApp.getMouseMapX();
				// config.pos.y = mapApp.getMouseMapY();
				break;
			case 'addCarItem' :
				config.treeType = 3;
				config.pos = {};
				config.pos.x = eg.lon;
				config.pos.y = eg.lat;
				config.po = {};
				config.po.x = eg.lon;
				config.po.y = eg.lat;
				break;
			case 'addSimpleItem' :
				config.treeType = 4;
				config.pos = {};
				config.pos.x = eg.lon;
				config.pos.y = eg.lat;
				config.po = {};
				config.po.x = eg.lon;
				config.po.y = eg.lat;
				break;
			case 'addBayonetItem' :
				config.treeType = 5;
				config.po = {};
				config.pos = {};
				config.po.x = eg.lon;
				config.po.y = eg.lat;
				config.pos.x = eg.lon;
				config.pos.y = eg.lat;
				break;

		}
		this.showAddNodeWindow(config);
	},
	showAddNodeWindow : function(config) {
		this.addNodePanel = new cms.emap.addNode({
					// mapId : this.mapId,
					treeType : config.treeType,
					mapName : config.mapName,
					pos : config.pos,
					po : config.po,
					listeners : {
						AddNodeEvent : this.addNodeHandler.createDelegate(this),
						Close : this.closeWin.createDelegate(this)
					}
				});
		// this.controlItem.add('addNodePanel', this.addNodePanel);
		this.addNodeWin = new Ext.Window({
					title : config.title,
					resizable : false,
					// closeAction : 'hide',
					layout : 'fit',
					width : 330,
					height : 445,
					// autoScroll : true,
					border : false,
					frame : true,
					modal : true,
					items : [this.addNodePanel.getControl()/* ,this.description */]
				});

		this.addNodeWin.show();
	},
	addNodeHandler : function(event) {
		switch (event.params.operate) {
			case 'ConfirmBtn' :
				this.addNodeHandlers(event.params.data);
				break;
			case 'CancelBtn' :
				break;
			default :
				break;
		}
		this.addNodeWin.close();
	},
	addNodeHandlers : function(data) {
		this.vector.removeAllFeatures();
		this.initMapEle();
	},
	initMapEle : function() {
		Ext.Ajax.request({
					url : '/ezEmapInfoAction!getAllEmapElements.action',
					params : {
						elementType : this.thematicType,
						eleadd : this.thematicType
					},
					success : this.initELeSuccess.createDelegate(this),
					failure : this.initELeFailure.createDelegate(this)
				});
	},
	initELeSuccess : function(response) {
		if (response.status == 200 && response.statusText == "OK") {
			if (response.responseText == '')
				return;
			var elObj = Ext.decode(response.responseText);
			for (var index = 0, len = elObj.emapElements.length; index < len; index++) {
				var el = elObj.emapElements[index];
				var id = el.elementId;
				var linkId = el.linkId;
				var name = el.elementName;
				var font = "宋体";
				var fontPos = 5;
				var shapeJson = Ext.decode(el.shapeXml);
				var x = shapeJson.Point.X;
				var y = shapeJson.Point.Y;
				var revJson = Ext.decode(el.xmlRev);
				var fontSize = revJson.Font.FontSize;
				// var fontColor = this.decodeC(revJson.Font.FontColor);
				// var bKGroundColor = this.decodeC(revJson.BKGroundColor);
				var bKTransparent = revJson.BKTransparent;
				var nodeInfo = {}, style = {};
				nodeInfo.elementType = el.elementType;
				nodeInfo.elementSubType = el.elementSubType;
				nodeInfo.name = name;
				nodeInfo.id = id;
				nodeInfo.linkId = linkId;
				nodeInfo.chedaoshu = el.chedaoshu;
				nodeInfo.bianhao = el.bianhao;
				nodeInfo.zhuangTai = el.zhuangTai;
				nodeInfo.xiansu = el.xiansu;
				nodeInfo.jiankongip = el.jiankongip;
				nodeInfo.jiankongtongdao = el.jiankongtongdao;
				nodeInfo.geox = el.XPos;
				nodeInfo.geoy = el.YPos;
				style.x = x;
				style.y = y;
				style.fontSize = fontSize;
				// style.fontColor = fontColor;
				// style.bKGroundColor = bKGroundColor;
				style.bKTransparent = bKTransparent;
				style.font = font;
				this.addNodeTomap(nodeInfo, style);
			}
			// this.updateStatisticsHandler();
		}
	},
	initELeFailure : function(response) {
		cms.ext.alert('提示', '初始化失败!');
	},
	addNodeTomap : function(nodeInfo, style) {
		if (nodeInfo.elementType == 6000 && nodeInfo.zhuangTai == 1) {
			nimage = iport + '/modules/its_map/hiklayers/gis/img/kakou.png'
		} else if (nodeInfo.elementType == 3000 && nodeInfo.elementSubType == 0) {
			nimage = iport
					+ '/modules/its_map/hiklayers/gis/img/jiankongdian.png'
		} else if (nodeInfo.elementType == 3000 && nodeInfo.elementSubType == 1) {
			nimage = iport + '/modules/its_map/hiklayers/gis/img/banqiu.png'
		} else if (nodeInfo.elementType == 3000 && nodeInfo.elementSubType == 2) {
			nimage = iport + '/modules/its_map/hiklayers/gis/img/kuaiqiu.png'
		} else if (nodeInfo.elementType == 3000 && nodeInfo.elementSubType == 3) {
			nimage = iport + '/modules/its_map/hiklayers/gis/img/yuntai.png'
		} else if (nodeInfo.elementType == 6000 && nodeInfo.zhuangTai == 0) {
			nimage = iport + '/modules/its_map/hiklayers/gis/img/kakoucuo.png'
		} else if (nodeInfo.elementType == 5000) {
			nimage = iport + '/modules/its_map/hiklayers/gis/img/chezai.png'
		} else if (nodeInfo.elementType == 5100) {
			nimage = iport + '/modules/its_map/hiklayers/gis/img/danbing.png'
		}
		this.vector.addFeatures(new OpenLayers.Feature.Vector(
				new OpenLayers.Geometry.Point(style.x, style.y), {
					image : nimage,
					nodeinfos : nodeInfo,
					nodelinkid : nodeInfo.linkId,
					styles : style,
					nodename : nodeInfo.name,
					nodeid : nodeInfo.id
				}, {
					fillOpacity : 1,
					strokeOpacity : 1,
					strokeColor : "#000000",
					graphicWidth : 16,
					graphicHeight : 16,
					graphicName : nodeInfo.name,
					graphicTitle : nodeInfo.name,
					externalGraphic : nimage
				}));
	},
	createPopup : function(feature) {
		var nodeInfo = feature.attributes.nodeinfos;
		var itmap = ""
		if (nodeInfo != null && nodeInfo != "") {
			var typename;
			switch (nodeInfo.elementType) {
				case 6000 :
					typename = top.crossingManageName + "类型";
					break;
				case 4000 :
					typename = "报警输入类型";
					break;
				case 4001 :
					typename = "报警输出类型";
					break;
				case 3000 :
					typename = "监控点类型";
					break;
			}
			var typesub
			// alert(nodeInfo.Point);
			switch (parseInt(nodeInfo.elementSubType)) {
				case 0 :
					typesub = "枪机";
					break;
				case 1 :
					typesub = "半球";
					break;
				case 2 :
					typesub = "快球";
					break;
				case 3 :
					typesub = "云台";
					break;
				default :
					typesub = "卡口";
					break;
			}
			if (nodeInfo.elementType == 5000) {
				typesub = "车载";
			}
			if (nodeInfo.elementType == 5100) {
				typesub = "单兵";
			}
			if (nodeInfo.elementType == 6000) {
				var txt = "编号：" + nodeInfo.bianhao + '<p/>' + "车道数："
						+ nodeInfo.chedaoshu + '<p/>' + "限速值："
						+ nodeInfo.xiansu + ' km/h';

			} else if (nodeInfo.elementType == 5000) {
				var txt = "";
			} else if (nodeInfo.elementType == 5100) {
				var txt = "";
			} else {
				var txt = "相机IP：" + nodeInfo.jiankongip + '<p/>' + "相机通道："
						+ nodeInfo.jiankongtongdao;
			}
			this.btnSearch = new Ext.Button({
						width : 45,
						height : 10,
						layout : 'column',
						text : '实时过车',
						handler : function() {
							that.baywinc = that.bayonet
									.showbayintime(nodeInfo.linkId);
							that.bayonet.showpre(nodeInfo.linkId, nodeInfo.id);
							RemoveInfo();
							TryGetPassCarInfo();
						}
					});
			this.btnSearch1 = new Ext.Button({
						width : 45,
						height : 10,
						layout : 'column',
						text : '违法查询',
						handler : function() {
							that.bayonet.showvehiclealarmWin(nodeInfo.linkId)
						}
					});
			this.btnSearch2 = new Ext.Button({
						width : 45,
						height : 10,
						layout : 'column',
						text : '过车查询',
						handler : function() {
							that.bayonet.showvehiclepassWin(nodeInfo.linkId)
						}
					});
			this.btnSearch3 = new Ext.Button({
						width : 45,
						height : 10,
						layout : 'column',
						text : '流量统计',
						handler : function() {
							that.bayonet.showcartrafficWin(nodeInfo.linkId)
						}
					});
			this.btnSearch4 = new Ext.Button({
						width : 45,
						height : 10,
						layout : 'column',
						text : '频度分析',
						hidden : licParams.indexOf(50017) < 0,
						handler : function() {
							that.bayonet.showfre(nodeInfo.linkId)
						}
					});
			this.btnSearch5 = new Ext.Button({
						width : 45,
						height : 10,
						layout : 'column',
						text : top.crossingManageName + '状态',
						handler : function() {
							that.bayonet.showcrossstateWin(nodeInfo.linkId)
						}
					});
			this.btnSearch6 = new Ext.Button({
						width : 83,
						height : 10,
						layout : 'column',
						text : '视频预览',
						handler : function() {
							that.vpn.previewByClkEl(nodeInfo.linkId)
						}
					});
			this.btnSearch7 = new Ext.Button({
						width : 83,
						height : 10,
						layout : 'column',
						text : '视频回放',
						handler : function() {
							that.mp.rectplaybackHandler(nodeInfo.linkId);
						}
					});
			this.btnSearch8 = new Ext.Button({
						width : 120,
						height : 10,
						layout : 'column',
						text : '车载视频预览',
						handler : function() {
							that.mp.getGPSInfoWin(nodeInfo.id)
						}
					});
			this.btnSearch9 = new Ext.Button({
						width : 120,
						height : 10,
						layout : 'column',
						text : '单兵视频预览',
						handler : function() {
							that.mp.getGPSInfoWin(nodeInfo.id)
						}
					});
			if (nodeInfo.elementType == 6000 && mapMode == 0) {
				var widthx = 0
				if (licParams.indexOf(50017) > 0) {
					widthx = 3
				} else {
					widthx = 0
				}
				itmap = [{
					html : '<p/>' + "名称：" + nodeInfo.name + '<p/>' + '<p/>'
							+ "类型：" + typesub + '<p/>' + txt,
					baseCls : 'background-color:#CCD9E8'
				}, {
					baseCls : 'background-color:#CCD9E8',
					frame : false,
					border : false,
					layout : 'column',
					items : [this.btnSearch, {
								baseCls : 'background-color:#CCD9E8',
								width : 3,
								border : false
							}, this.btnSearch2, {
								baseCls : 'background-color:#CCD9E8',
								width : 3,
								border : false
							}, this.btnSearch1]
				}, {
					style : 'padding: 2px 0px 2px 0px',
					baseCls : 'background-color:#CCD9E8',
					frame : false,
					border : false,
					layout : 'column',
					items : [this.btnSearch3, {
								baseCls : 'background-color:#CCD9E8',
								width : 3,
								border : false
							}, this.btnSearch4, {
								baseCls : 'background-color:#CCD9E8',
								width : widthx,
								border : false
							}, this.btnSearch5]
				}]
			} else if (nodeInfo.elementType == 3000 && mapMode == 0) {
				itmap = [{
					html : '<p/>' + "名称：" + nodeInfo.name + '<p/>' + '<p/>'
							+ "类型：" + typesub + '<p/>' + txt,
					baseCls : 'background-color:#CCD9E8'
				}, {
					baseCls : 'background-color:#CCD9E8',
					frame : false,
					border : false,
					layout : 'column',
					items : [this.btnSearch6, {
								baseCls : 'background-color:#CCD9E8',
								width : 20,
								border : false
							}, this.btnSearch7]
				}]
			} else if (nodeInfo.elementType == 5000 && mapMode == 0) {
				itmap = [{
					html : '<p/>' + "名称：" + nodeInfo.name + '<p/>' + '<p/>'
							+ "类型：" + typesub + '<p/>' + txt,
					baseCls : 'background-color:#CCD9E8'
				}, {
					baseCls : 'background-color:#CCD9E8',
					frame : false,
					border : false,
					layout : 'column',
					items : [this.btnSearch8]
				}]
			} else if (nodeInfo.elementType == 5100 && mapMode == 0) {
				itmap = [{
					html : '<p/>' + "名称：" + nodeInfo.name + '<p/>' + '<p/>'
							+ "类型：" + typesub + '<p/>' + txt,
					baseCls : 'background-color:#CCD9E8'
				}, {
					baseCls : 'background-color:#CCD9E8',
					frame : false,
					border : false,
					layout : 'column',
					items : [this.btnSearch9]
				}]
			} else {
				itmap = [{
					html : '<p/>' + "名称：" + nodeInfo.name + '<p/>' + '<p/>'
							+ "类型：" + typesub + '<p/>' + txt,
					baseCls : 'background-color:#CCD9E8'
				}]
			}
		} else if (feature.attributes.mesa != null) {
			itmap = [{
						baseCls : 'background-color:#CCD9E8',
						html : '<p/>位置：' + feature.attributes.mesa + '<p/>'
					}]

		} else {
			itmap = [{
				baseCls : 'background-color:#CCD9E8',
				html : '<p/>开始时间：' + feature.attributes.stime + '<p/>'
						+ '结束时间：' + feature.attributes.etime
			}]
		}
		this.popup = new GeoExt.Popup({
					title : '信息',
					location : feature,
					resizable : false,
					width : 200,
					plain : true,
					// maximizable : true,
					collapsible : true,
					border : false,
					anchorPosition : "auto",
					items : itmap
				});
		this.popup.on({
					close : function() {
						if (OpenLayers.Util.indexOf(
								that.vector.selectedFeatures, feature) > -1) {
							that.selectCtrl.unselect(feature);
						}
					}
				});
		if ((nodeInfo != null && nodeInfo != "")
				|| (feature.attributes.stime != null && feature.attributes.stime != "")
				|| feature.attributes.mesa != null) {
			this.popup.show();
		}
	},
	closeWin : function() {
		this.addNodeWin.close();
	},
	updatePosSuccess : function(response) {
		// if (response.status == 200 && response.statusText == "OK"
		// && response.responseText == '1') {
		// var elObj = this.elementItem.get(this.mapElPrefix + this.elementId);
		// elObj.style.x = this.mapApp.getMouseMapX();
		// elObj.style.y = this.mapApp.getMouseMapY();
		// } else {
		// cms.ext.alert('提示', '更新失败!');
		// }
	},
	updatePosFailure : function(response) {
		cms.ext.alert('提示', '更新失败!');
	},
	mulSelect : function(se) {
		if (se == 'dftm') {
			this.stime = '';
			fillstyle = {
				strokeWidth : 2,
				strokeOpacity : 1,
				strokeColor : "#666666",
				fillColor : "blue",
				fillOpacity : 0.3
			}
		} else {
			fillstyle = null;
		}
		var styleMap = new OpenLayers.StyleMap({
					"default" : new OpenLayers.Style(null, {
								rules : [new OpenLayers.Rule({
											symbolizer : {
												"Polygon" : {
													strokeWidth : 2,
													strokeOpacity : 1,
													strokeColor : "#666666",
													fillColor : "white",
													fillOpacity : 0.3
												}
											}
										})]
							})
				});
		if (this.ms != null) {
			this.ms.deactivate();
		}
		this.ms = new OpenLayers.Control.Measure(OpenLayers.Handler.Polygon, {
			geodesic : true,
			persist : true,
			handlerOptions : {
				layerOptions : {
					styleMap : styleMap
				}
			},
			eventListeners : {
				measure : function(event) {
					this.poFeature = new OpenLayers.Feature.Vector(
							new OpenLayers.Geometry.Polygon(new OpenLayers.Geometry.LinearRing(event.geometry
									.getVertices())), {
								stime : this.stime,
								etime : this.etime
							}, fillstyle);
					try {
						this.vector.addFeatures([this.poFeature]);
					} catch (e) {
						this.ms.deactivate();
					}
					if (se == 'dftm') {
						this.poflistdftm.push(this.poFeature);
					} else {
						this.poflist.push(this.poFeature);
					}
					if (se == 'dftm') {
						this.dftmwin = this.vpn.recallback(event.geometry
								.getVertices())
					} else if (se == 'lbtx') {
						this.recallback(event.geometry.getVertices());
					}
					this.ms.deactivate();
				}.createDelegate(this)
			}
		})
		this.map.addControl(this.ms);
		this.ms.activate();
	},
	quyuSelect : function() {
		if (gsclick == true) {
			this.starttimeField = new cms.form.DateFieldCtrl({
						name : 'starttimeField',
						width : 145,
						fieldLabel : '开始时间',
						defaultValue : new Date(bay.common.getMiniDate()),
						dataFormat : 'yyyy-MM-dd HH:mm:ss'
					});
			this.stoptimeField = new cms.form.DateFieldCtrl({
						name : 'stoptimeField',
						width : 145,
						fieldLabel : '结束时间',
						defaultValue : new Date(bay.common.getMaxDate()),
						dataFormat : 'yyyy-MM-dd HH:mm:ss'
					});
			this.rectBtn = new Ext.Button({
						width : 70,
						text : '开始选择',
						handler : this.rectHandler.createDelegate(this)

					});
			this.bayseachBtn = new Ext.Button({
						width : 70,
						text : '查询',
						handler : function() {
							this.cc.carNum(this.gsshuzu);
						}.createDelegate(this)

					});
			this.celrectBtn = new Ext.Button({
						width : 70,
						text : '重置',
						handler : this.celrectHandler.createDelegate(this)

					});
			this.qypz = new Ext.form.FormPanel({
						labelAlign : 'left',
						border : false,
						frame : false,
						height : 100,
						labelWidth : 62,
						items : [{
							width : 230,
							layout : 'column',
							border : false,
							frame : false,
							defaults : {
								labelWidth : 62,
								layout : 'form',
								border : false,
								frame : false
							},
							items : [{
										style : 'padding:6px 0px 0px 7px',
										items : this.starttimeField
												.getControl()
									}, {
										style : 'padding:0px 0px 0px 7px',
										items : this.stoptimeField.getControl()
									}, {
										layout : 'column',
										style : 'padding:6px 0px 0px 7px',
										items : [this.rectBtn, {
													border : false,
													width : 3
												}, this.bayseachBtn, {
													border : false,
													width : 3
												}, this.celrectBtn]
									}]
						}]
					});
			this.allPanel = new Ext.Window({
				title : '区域碰撞',
				layout : 'column',
				width : 240,
				height : 130,
				border : false,
				maximizable : false,
				closeAction : 'hide',
				collapsible : true,
				resizable : false,
				anchorPosition : "auto",
				items : [this.qypz],
				listeners : {
					hide : function() {
						this.gsshuzu.length = 0;
						if (this.poFeature != null) {
							for (var ir = 0; ir < this.poflist.length; ir++) {
								this.vector.removeFeatures(this.poflist[ir]);
							}
						}
						if (this.ms != null) {
							this.ms.deactivate();
						}
						if (this.popup != null) {
							this.popup.close();
						}
						this.stime = "";
						this.etime = "";
						this.gis = 0;
						gsclick = true;
						if (top.window.frames["wocao97"].document
								.getElementById('dpOkInput') != null) {
							top.document.getElementById('cao97').style.top = '';
						}
					}.createDelegate(this)
				}
			});
			this.allPanel.setPosition(document.body.clientWidth - 242, 37)
			gsclick = false;
			this.allPanel.show();
		} else {
			this.allPanel.setVisible(true);
		}
	},
	zuzhijigou : function() {
		if (gsclick1 == true) {
			this.zjPanel = new Ext.Window({
						title : '组织机构',
						layout : 'column',
						width : 240,
						height : 350,
						border : false,
						layout : 'fit',
						maximizable : false,
						closeAction : 'hide',
						resizable : false,
						collapsible : true,
						anchorPosition : "auto",
						items : [this.nav.cameraTree],
						listeners : {
							hide : function() {
								gsclick1 = true;
							}.createDelegate(this)
						}
					});
			this.zjPanel.setPosition(document.body.clientWidth - 242, 37)

			gsclick1 = false;
			this.zjPanel.show();
		} else {
			this.zjPanel.setVisible(true);
		}
	},
	yongdu : function() {
		if (this.ydc == 0) {
			this.busylayer.redraw(true);
			this.map.addLayers([this.busylayer]);
			this.ydc = 1
		} else if (this.ydc == 1) {
			this.map.removeLayer(this.busylayer);
			this.ydc = 0
		}
	},
	netWAnalyWin : function() {
		if (this.netAnalyWin == null) {
			this.store = new Ext.data.SimpleStore({
						proxy : new Ext.ux.data.PagingMemoryProxy(shuzu1),
						fields : [{
									name : 'roadname',
									type : 'string'
								}, {
									name : 'simWay',
									type : 'string'
								}],
						listeners : {
							load : function() {
								this.netAnalyWin.setTitle("路径信息---总长度:"
										+ this.netAnalyLen + "米");
							}.createDelegate(this)
						}

					});
			var cm = new Ext.grid.ColumnModel({
						defaults : {
							sortable : false
						},
						columns : [new Ext.grid.RowNumberer(), {
									header : '道路名称',
									dataIndex : 'roadname',
									align : 'center'
								}]
					});
			this.resultPanel = new Ext.grid.GridPanel({
						ds : this.store,
						height : document.body.clientHeight - 285,
						// autoHeight:true,
						cm : cm,
						viewConfig : {
							forceFit : true
						},
						// view : new Ext.ux.grid.BufferView({
						// rowHeight : 20,
						// scrollDelay : false
						// }),
						border : false,
						columnLines : false,
						frame : false,
						autoScroll : true,
						trackMouseOver : true,
						loadMask : true,
						id : 'vehiclenetroad',
						stripeRows : true,
						bbar : new Ext.PagingToolbar({
									pageSize : 100,
									store : this.store,
									displayInfo : false
								}),
						listeners : {
							rowclick : this.locationMapEL.createDelegate(this)
						}
					});
			this.netAnalyWin = new Ext.Window({
						title : '路径信息',
						layout : 'column',
						width : 240,
						height : 350,
						border : false,
						layout : 'fit',
						maximizable : false,
						closeAction : 'hide',
						resizable : false,
						collapsible : true,
						anchorPosition : "auto",
						items : [this.resultPanel],
						listeners : {
							hide : function() {
								if (this.aqmarkers != null
										&& this.aqmarkerse != null) {
									this.aqmarkers.removeMarker(this.markers);
									this.aqmarkerse.removeMarker(this.markere);
									this.map.removeLayer(this.aqmarkers);
									this.map.removeLayer(this.aqmarkerse);
								}
								if (this.lineFeature != null) {
									this.vector.removeFeatures([
											this.lineFeature,
											this.lineFeatures,
											this.lineFeaturee]);
								}
								if (this.linestsd != null) {
									this.vector.removeFeatures(this.linestsd);
								}
								if (this.aqmarkersb != null) {
									for(var i=0;i<this.markerbsz.length;i++)
									{
									this.aqmarkersb.removeMarker(this.markerbsz[i]);									
									}
									this.markerbsz.length=0;
								}
								this.stx1 = "";
							}.createDelegate(this)
						}
					});
			this.netAnalyWin.setPosition(document.body.clientWidth - 242, 37);
			this.netAnalyWin.show();
		} else {
			this.netAnalyWin.setPosition(document.body.clientWidth - 242, 37);
			this.netAnalyWin.setVisible(true);
		}
	},
	kongjian : function() {
		if (this.kjPanel == null) {
			this.kjPanel = new Ext.Window({
						title : '空间查询',
						layout : 'column',
						width : 240,
						height : 380,
						border : false,
						layout : 'fit',
						maximizable : false,
						closeAction : 'hide',
						// resizable : false,
						collapsible : true,
						resizable : false,
						anchorPosition : "auto",
						items : [this.nav.aroundpanel],
						listeners : {
							hide : function() {
								gsclick1 = true;
								if (this.linests.length != 0) {
									if (this.popup != null) {
										this.popup.close();
									}
									this.vector.removeFeatures(this.linests);
									this.linests.length = 0;
								}
							}.createDelegate(this)
						}
					});
			this.kjPanel.setPosition(document.body.clientWidth - 242, 37);
			gsclick1 = false;
			this.kjPanel.show();
		} else {
			this.kjPanel.setPosition(document.body.clientWidth - 242, 37);
			this.kjPanel.setVisible(true);
		}
	},
	locationMapEL : function(grid, rowIndex, event) {
		var record = grid.getStore().getAt(rowIndex);
		this.huaxianOSD(record.get('simWay'));
	},
	celrectHandler : function() {
		this.gsshuzu.length = 0;
		if (this.poFeature != null) {
			for (var ir = 0; ir < this.poflist.length; ir++) {
				this.vector.removeFeatures(this.poflist[ir]);
			}
		}
		if (this.ms != null) {
			this.ms.deactivate();
		}
		if (this.popup != null) {
			this.popup.close();
		}
		this.gis = 0;
	},
	rectHandler : function() {
		if (this.starttimeField.getValue().trim() == ''
				|| this.stoptimeField.getValue().trim() == '') {
			cms.ext.alert('错误', '时间不能为空！');
			return;
		}
		if (this.starttimeField.getValue() != ''
				&& this.stoptimeField.getValue() != '') {
			if (cms.util.compareDateTime(this.stoptimeField.getValue(),
					this.starttimeField.getValue()) != 1) {
				cms.ext.alert('错误', '开始时间必须小于结束时间，请检查！');
				return;
			}
		}
		this.stime = this.starttimeField.getValue().trim();
		this.etime = this.stoptimeField.getValue().trim();
		this.mulSelect('lbtx');
	},
	recallback : function(strs) {
		var str = "";
		for (var i = 0; i < strs.length; i++) {
			str = strs[i].x + ',' + strs[i].y + ',' + str
			str = str.trim().substring(0, str.length - 1);
		}
		this.gis = 1;
		this.str = str;
		Ext.Ajax.request({
					url : '/ezEmapInfoAction!queryRect.action',
					params : {
						elementName : '',
						strlen : str,
						multab : 6000,
						rect : 1
					},
					success : function(response) {
						var jsonResult = Ext.util.JSON
								.decode(response.responseText);
						var crossingVehiclePass = jsonResult.emapElements;
						for (var i = 0; i < crossingVehiclePass.length; i++) {
							var szChildDataArray = [];
							szChildDataArray[0] = crossingVehiclePass[i].linkId;
							szChildDataArray[1] = this.starttimeField
									.getValue();
							szChildDataArray[2] = this.stoptimeField.getValue();
							this.gsshuzu.push(szChildDataArray);
						}
					}.createDelegate(this),
					failure : function(response) {
						cms.ext.alert('错误', '查询失败!');
					}
				}, this);
	},
	gpsRoad : function() {
		if (gdclick == true) {
			this.gr = new Ext.Window({
				title : '轨迹查询',
				border : false,
				modal : false,
				layout : 'fit',
				width : 240,
				height : document.body.clientHeight - 150,
				closeAction : 'hide',
				maximizable : false,
				collapsible : true,
				anchorPosition : "auto",
				resizable : false,
				items : [this.nav.trapanel],
				listeners : {
					hide : function() {
						gdclick = true;
						if (that.lineFeature != null && that.gdmarkers != null) {
							that.vector.removeFeatures(that.lineFeature);
							that.gdmarkers.removeMarker(that.marker);
							that.map.removeLayer(that.gdmarkers);
						}
						if (top.window.frames["wocao97"].document
								.getElementById('dpOkInput') != null) {
							top.document.getElementById('cao97').style.top = '';
						}
					}
				}
			});
			this.gr.setPosition(document.body.clientWidth - 242, 37)

			gdclick = false;
			this.gr.show();
		} else {
			this.gr.setVisible(true);
		}
	},
	huaxianOS : function(eventObject) {
		if (this.lineFeature != null) {
			this.vector.removeFeatures([this.lineFeature, this.lineFeatures,
					this.lineFeaturee]);
		}
		var style_green = {
			strokeColor : "#ff0000",
			strokeOpacity : 0.7,
			strokeWidth : 3,
			pointRadius : 6,
			pointerEvents : "visiblePainted"
		};
		var style_green1 = {
			strokeColor : "#ff0000",
			strokeOpacity : 0.7,
			strokeWidth : 3,
			pointRadius : 6,
			pointerEvents : "visiblePainted",
			strokeDashstyle : "dash"
		};
		var lp = eventObject.params.geom;
		var pointList = [], pointLists = [], pointListe = [];
		for (var i = 1; i < lp.length - 1; i++) {
			var newPoint = new OpenLayers.Geometry.Point(lp[i].x, lp[i].y);
			pointList.push(newPoint);
		}
		this.lineFeature = new OpenLayers.Feature.Vector(
				new OpenLayers.Geometry.LineString(pointList), null,
				style_green);
		var newPoint1 = new OpenLayers.Geometry.Point(lp[0].x, lp[0].y);
		var newPoint2 = new OpenLayers.Geometry.Point(lp[1].x, lp[1].y);
		pointLists.push(newPoint1);
		pointLists.push(newPoint2);
		var newPoint3 = new OpenLayers.Geometry.Point(lp[lp.length - 2].x,
				lp[lp.length - 2].y);
		var newPoint4 = new OpenLayers.Geometry.Point(lp[lp.length - 1].x,
				lp[lp.length - 1].y);
		pointListe.push(newPoint3);
		pointListe.push(newPoint4);
		this.lineFeatures = new OpenLayers.Feature.Vector(
				new OpenLayers.Geometry.LineString(pointLists), null,
				style_green1);
		this.lineFeaturee = new OpenLayers.Feature.Vector(
				new OpenLayers.Geometry.LineString(pointListe), null,
				style_green1);
		this.vector.addFeatures([this.lineFeature, this.lineFeatures,
				this.lineFeaturee]);
		// this.fon();

	},
	huaxianOSD : function(eventObject) {
		if (this.linestsd.length != 0) {
			// if (this.popup != null) {
			// this.popup.close();
			// }
			this.vector.removeFeatures(this.linestsd);
			this.linestsd.length = 0;
		}
		var style_green = {
			strokeColor : "#1166cc",
			strokeOpacity : 0.7,
			fillColor : "blue",
			fillOpacity : 0.3,
			strokeWidth : 5,
			pointRadius : 6,
			pointerEvents : "visiblePainted"
		};
		var pointListd = eventObject;
		this.lineFeaturetd = new OpenLayers.Feature.Vector(
				new OpenLayers.Format.GeoJSON().read(pointListd, "Geometry",
						null), {}, style_green);
		this.linestsd.push(this.lineFeaturetd);
		this.vector.addFeatures(this.linestsd);
		var pgos = new OpenLayers.Format.GeoJSON().read(pointListd, "Geometry",
				null).getVertices();
		this.map.panTo(new OpenLayers.LonLat(pgos[0].x, pgos[0].y));
		// this.fon();

	},
	startReplay : function(eventObject) {
		if (this.lineFeature != null && this.gdmarkers != null) {
			this.vector.removeFeatures(this.lineFeature);
			this.gdmarkers.removeMarker(this.marker);
		}
		var style_green = {
			strokeColor : "#ff0000",
			strokeOpacity : 0.7,
			strokeWidth : 3,
			pointRadius : 6,
			pointerEvents : "visiblePainted"
		};
		var lonlat = new OpenLayers.LonLat(eventObject.params.firstpx,
				eventObject.params.firstpy);
		var lp = eventObject.params.pointsStr.split(",")
		var pointList = [];
		for (var i = 0; i < lp.length; i++) {
			var newPoint = new OpenLayers.Geometry.Point(lp[i], lp[i + 1]);
			pointList.push(newPoint);
			i = i + 1;
		}
		var zoom = this.map.getZoom();
		this.map.setCenter(lonlat, zoom);

		this.gdmarkers = new OpenLayers.Layer.Markers("绘制层");
		this.map.addLayer(this.gdmarkers);

		var imgUrl = "/modules/emap_js/images/tack.png";
		var icon = new OpenLayers.Icon(imgUrl, new OpenLayers.Size(25, 37),
				new OpenLayers.Pixel(-14, -35));
		this.marker = new OpenLayers.Marker(lonlat, icon);
		this.gdmarkers.addMarker(this.marker);

		this.lineFeature = new OpenLayers.Feature.Vector(
				new OpenLayers.Geometry.LineString(pointList), null,
				style_green);
		this.vector.addFeatures([this.lineFeature]);
		// this.fon();

	},
	huaxian : function(eventObject) {
		var style_green = {
			strokeColor : "#ff0000",
			strokeOpacity : 0.7,
			fillColor : "white",
			fillOpacity : 0.3,
			strokeWidth : 3,
			pointRadius : 6,
			pointerEvents : "visiblePainted"
		};
		for (var i = 0; i < eventObject.params.geom.length; i++) {
			var pointListd = eventObject.params.geom[i][0];
			this.lineFeaturet = new OpenLayers.Feature.Vector(
					new OpenLayers.Format.GeoJSON().read(pointListd,
							"Geometry", null), {
						mesa : eventObject.params.geom[i][1]
					}, style_green);
			this.linests.push(this.lineFeaturet);
		}
		this.vector.addFeatures(this.linests);
	},
	lonat : function(event) {
		var ph = event.geometry.toString().split(",");
		var php = ph[ph.length - 2];
		var phpp = php.split(" ");
		return phpp;
	},
	hyun : function(x, y, r) {
		var pointList11 = [];
		for (i = 10; i <= 360; i++) {
			asdf = this.computation(x, y, i, r);
			var newPoint = new OpenLayers.Geometry.Point(asdf.x, asdf.y);
			pointList11.push(newPoint);
		}
		this.circle = new OpenLayers.Feature.Vector(
				new OpenLayers.Geometry.Polygon(new OpenLayers.Geometry.LinearRing(pointList11)),
				null, {
					fillColor : '#000',
					fillOpacity : 0.1,
					strokeWidth : 0
				});
		this.hyunlist.push(this.circle);
		this.vector.addFeatures([this.circle]);
	},
	rad : function(angel_d) {
		return angel_d * Math.PI / 180.0;
	},
	computation : function(startLon, startLat, angel1, distance) {
		B1 = startLat;
		L1 = startLon;
		A1 = angel1;
		S = distance;
		a = 6378245.0;
		b = 6356752.3142;
		c = Math.pow(a, 2) / b;
		alpha = (a - b) / a;
		e = Math.sqrt(Math.pow(a, 2) - Math.pow(b, 2)) / a;
		e2 = Math.sqrt(Math.pow(a, 2) - Math.pow(b, 2)) / b;
		B1 = this.rad(B1);
		L1 = this.rad(L1);
		A1 = this.rad(A1);
		W = Math.sqrt(1 - Math.pow(e, 2) * Math.pow(Math.sin(B1), 2));
		V = W * (a / b);
		E1 = e;// 第一偏心率
		// 计算起点的归化纬度
		W1 = W; // ''Sqr(1 - e1 * e1 * Sin(B1 ) * Sin(B1 ))
		sinu1 = Math.sin(B1) * Math.sqrt(1 - E1 * E1) / W1;
		cosu1 = Math.cos(B1) / W1;
		// 计算辅助函数值
		sinA0 = cosu1 * Math.sin(A1);
		cotq1 = cosu1 * Math.cos(A1);
		sin2q1 = 2 * cotq1 / (Math.pow(cotq1, 2) + 1);
		cos2q1 = (Math.pow(cotq1, 2) - 1) / (Math.pow(cotq1, 2) + 1);
		// 计算系数AA,BB,CC及AAlpha, BBeta的值
		cos2A0 = 1 - Math.pow(sinA0, 2);
		e2 = Math.sqrt(Math.pow(a, 2) - Math.pow(b, 2)) / b;
		k2 = e2 * e2 * cos2A0;
		aa = b * (1 + k2 / 4 - 3 * k2 * k2 / 64 + 5 * k2 * k2 * k2 / 256);
		BB = b * (k2 / 8 - k2 * k2 / 32 + 15 * k2 * k2 * k2 / 1024);
		CC = b * (k2 * k2 / 128 - 3 * k2 * k2 * k2 / 512);
		e2 = E1 * E1;
		AAlpha = (e2 / 2 + e2 * e2 / 8 + e2 * e2 * e2 / 16)
				- (e2 * e2 / 16 + e2 * e2 * e2 / 16) * cos2A0
				+ (3 * e2 * e2 * e2 / 128) * cos2A0 * cos2A0;
		BBeta = (e2 * e2 / 32 + e2 * e2 * e2 / 32) * cos2A0
				- (e2 * e2 * e2 / 64) * cos2A0 * cos2A0;
		// 计算球面长度
		q0 = (S - (BB + CC * cos2q1) * sin2q1) / aa;
		sin2q1q0 = sin2q1 * Math.cos(2 * q0) + cos2q1 * Math.sin(2 * q0);
		cos2q1q0 = cos2q1 * Math.cos(2 * q0) - sin2q1 * Math.sin(2 * q0);
		q = q0 + (BB + 5 * CC * cos2q1q0) * sin2q1q0 / aa;
		// 计算经度差改正数
		theta = (AAlpha * q + BBeta * (sin2q1q0 - sin2q1)) * sinA0;
		// 计算终点大地坐标及大地方位角,操他妈的终于出来了。
		sinu2 = sinu1 * Math.cos(q) + cosu1 * Math.cos(A1) * Math.sin(q);
		B2 = Math.atan(sinu2
				/ (Math.sqrt(1 - E1 * E1) * Math.sqrt(1 - sinu2 * sinu2)))
				* 180 / Math.PI;
		lamuda = Math.atan(Math.sin(A1) * Math.sin(q)
				/ (cosu1 * Math.cos(q) - sinu1 * Math.sin(q) * Math.cos(A1)))
				* 180 / Math.PI;
		if (Math.sin(A1) > 0) {
			if (Math.sin(A1)
					* Math.sin(q)
					/ (cosu1 * Math.cos(q) - sinu1 * Math.sin(q) * Math.cos(A1)) > 0)
				lamuda = Math.abs(lamuda);
			else
				lamuda = 180 - Math.abs(lamuda);
		} else {
			if (Math.sin(A1)
					* Math.sin(q)
					/ (cosu1 * Math.cos(q) - sinu1 * Math.sin(q) * Math.cos(A1)) > 0)
				lamuda = Math.abs(lamuda) - 180;
			else
				lamuda = -Math.abs(lamuda);
		}
		L2 = L1 * 180 / Math.PI + lamuda - theta * 180 / Math.PI;

		A2 = Math.atan(cosu1 * Math.sin(A1)
				/ (cosu1 * Math.cos(q) * Math.cos(A1) - sinu1 * Math.sin(q)))
				* 180 / Math.PI;
		if (Math.sin(A1) > 0) {
			if (cosu1
					* Math.sin(A1)
					/ (cosu1 * Math.cos(q) * Math.cos(A1) - sinu1 * Math.sin(q)) > 0)
				A2 = 180 + Math.abs(A2);
			else
				A2 = 360 - Math.abs(A2);
		} else {
			if (cosu1
					* Math.sin(A1)
					/ (cosu1 * Math.cos(q) * Math.cos(A1) - sinu1 * Math.sin(q)) > 0)
				A2 = Math.abs(A2);
			else
				A2 = 180 - Math.abs(A2);
		}
		result = {
			x : L2,
			y : B2
		};
		return result;
	},
	dehyun : function() {
		if (that.circle != null) {
			for (var ir = 0; ir < that.hyunlist.length; ir++) {
				that.vector.removeFeatures(that.hyunlist[ir]);
			}
		}
	},
	huadians : function(eventObject) {
		if (this.aqmarkers != null) {
			this.aqmarkers.removeMarker(this.markers);
		}
		if (this.aqmarkers == null) {
			this.aqmarkers = new OpenLayers.Layer.Markers("绘制层");
		}
		this.map.addLayer(this.aqmarkers);
		var imgUrl = "/modules/emap_js/images/green_start.png";
		var icon = new OpenLayers.Icon(imgUrl, new OpenLayers.Size(25, 37),
				new OpenLayers.Pixel(-14, -35));
		this.markers = new OpenLayers.Marker(eventObject.params.eg, icon);
		this.aqmarkers.addMarker(this.markers);
	},
	huadiane : function(eventObject) {
		if (this.aqmarkerse != null) {
			this.aqmarkerse.removeMarker(this.markere);
		}
		if (this.aqmarkerse == null) {
			this.aqmarkerse = new OpenLayers.Layer.Markers("绘制层");
		}
		this.map.addLayer(this.aqmarkerse);
		var imgUrl = "/modules/emap_js/images/red_end.png";
		var icon = new OpenLayers.Icon(imgUrl, new OpenLayers.Size(25, 37),
				new OpenLayers.Pixel(-14, -35));
		this.markere = new OpenLayers.Marker(eventObject.params.eg, icon);
		this.aqmarkerse.addMarker(this.markere);
	},
	huadianb : function(eventObject) {
		if (this.markerbsz.length >= 3) {
			Ext.Msg.alert("提示", "障碍点最多设置三个");
			return;
		}
		if(this.stx2 == "" || this.stx2 == null)
		{
			Ext.Msg.alert("提示", "请先选择起终点");
			return;
		}
		if (this.aqmarkersb == null) {
			this.aqmarkersb = new OpenLayers.Layer.Markers("绘制层");
		}
		this.map.addLayer(this.aqmarkersb);
		var imgUrl = "/modules/emap_js/images/red_barrier.png";
		var icon = new OpenLayers.Icon(imgUrl, new OpenLayers.Size(25, 37),
				new OpenLayers.Pixel(-14, -35));
		this.markerb = new OpenLayers.Marker(eventObject.params.eg, icon);
		this.markerbsz.push(this.markerb)
		this.aqmarkersb.addMarker(this.markerb);
	},
	onEmapEventHandler : function(eventObject) {
		switch (eventObject.params.operate) {
			case 'addCameraItem' :
				this.showAddNodeWindowHandler(eventObject.params.item,
						"春宵一刻值千金，花有清香月有阴。歌管楼亭声细细，秋千院落夜沉沉。",
						eventObject.params.eg);
				break;
			case 'addIoInItem' :
				this.showAddNodeWindowHandler(eventObject.params.item);
				break;
			case 'addIoOutItem' :
				this.showAddNodeWindowHandler(eventObject.params.item);
				break;
			case 'addCarItem' :
				this.showAddNodeWindowHandler(eventObject.params.item, "",
						eventObject.params.eg);
				break;
			case 'addSimpleItem' :
				this.showAddNodeWindowHandler(eventObject.params.item, "去你妹",
						eventObject.params.eg);
				break;
			case 'addBayonetItem' :
				this.showAddNodeWindowHandler(eventObject.params.item,
						"成功的三条原则：1.坚持2.不要脸3.坚持不要脸", eventObject.params.eg);
				break;
			case 'searchCarContrailItem' :
				this.searchCarContrail();
				break;
			case 'InitEmap' :
				this.controlItem.get('ctrlPanel').mapApp = this.controlItem
						.get('map').mapApp;
				eventObject.eventCode = 'FnPanelEvent';
				this.fireEvent(eventObject.eventCode, eventObject);
				break;
			case 'removeElItem' :
				this.addNodeHandlers("春眠不觉晓，处处闻啼鸟。夜来键盘声，头发掉不少。");
				break;
			case 'UpdateStatistics' :
				this.updateStatisticsTBar(eventObject.params.statObj);
				break;
			case 'aroundQuery' :
				if (this.aqmarkers != null) {
					this.aqmarkers.removeMarker(this.marker);
				}
				if (this.aqmarkers == null) {
					this.aqmarkers = new OpenLayers.Layer.Markers("绘制层");
				}
				this.map.addLayer(this.aqmarkers);
				var imgUrl = "/modules/emap_js/images/tack.png";
				var icon = new OpenLayers.Icon(imgUrl, new OpenLayers.Size(25,
								37), new OpenLayers.Pixel(-14, -35));
				this.marker = new OpenLayers.Marker(eventObject.params.eg, icon);
				this.aqmarkers.addMarker(this.marker);

				this.arwin = this.vpn.showSearchWin(1);
				this.vpn.updateCenterStation(eventObject.params.eg);
				break;
			case 'alarmHistroy' :
				this.showAlarmListWin(eventObject.params.cameraId);
				break;
			case 'updateCoordinates' :
				this.controlItem.get('ctrlPanel').updateCenterStation(
						eventObject.params.xPos, eventObject.params.yPos);
				break;
			case 'Preview' :
				this.vpn.previewByClkEl(eventObject.params.cameraId);
				break
			case 'shortQuerys' :
				this.huadians(eventObject);
				this.stx1 = eventObject.params.eg.lon;
				this.sty1 = eventObject.params.eg.lat;
				break
			case 'shortQuerye' :
				this.huadiane(eventObject);
				this.stx2 = eventObject.params.eg.lon;
				this.sty2 = eventObject.params.eg.lat;
				if (this.stx1 != "" && this.stx1 != null) {
					this.netWAnalyWin();
					var mask = new Ext.LoadMask("vehiclenetroad", {
								msg : '数据加载中...    '
							});
					mask.show();
					Ext.Ajax.request({
						timeout : EXT_QUERY_TIME_OUT,
						url : '/NetAnalyAction!getNetAnalyInfo.action',
						params : {
							searchType : 0,
							mapMode : mapMode,
							stx1 : this.stx1,
							stx2 : this.stx2,
							sty1 : this.sty1,
							sty2 : this.sty2
						},
						success : function(response) {
							var jsonResult = Ext.util.JSON
									.decode(response.responseText);
							var emapElement = jsonResult.points;
							var emapElementN = jsonResult.roadIdList;
							var emapElementW = jsonResult.simWay;
							this.netAnalyLen = jsonResult.length;
							shuzu1.length = 0;
							for (var i = 0, len = emapElementN.length; i < len; i++) {
								var szChildDataArray = [];
								szChildDataArray[0] = emapElementN[i];
								szChildDataArray[1] = emapElementW[i].theGeom;
								shuzu1.push(szChildDataArray);
							}
							if (this.linests.length != 0) {
								this.vector.removeFeatures(this.linests);
								this.linests.length = 0;
							}
							var stot = {
								params : {
									geom : emapElement
								}
							}
							this.store.load({
										params : {
											start : 0,
											limit : 100
										}
									});
							this.huaxianOS(stot);
							this.stx8=this.stx1;
							this.stx1 = ""
							mask.hide();
						}.createDelegate(this),
						failure : function(response) {
							Ext.Msg.alert('错误', '查询失败!');
						}
					}, this);
				} else {
					Ext.Msg.alert("提示", "请先选择起点")
				}
				break;
			case 'shortQueryb' :
				if (this.markerbsz.length >= 3) {
					Ext.Msg.alert("提示", "障碍点最多设置三个");
					return;
				}
				this.huadianb(eventObject);
				this.stx3 = eventObject.params.eg.lon;
				this.sty3 = eventObject.params.eg.lat;
				this.szPointb.push(this.stx3);
				this.szPointb.push(this.sty3);
				if (this.stx3 != "" && this.stx3 != null && this.stx2 != "" && this.stx2 != null) {
					//this.netWAnalyWin();
					var mask = new Ext.LoadMask("vehiclenetroad", {
								msg : '数据加载中...    '
							});
					mask.show();
					Ext.Ajax.request({
						timeout : EXT_QUERY_TIME_OUT,
						url : '/NetAnalyAction!getNetAnalyInfo.action',
						params : {
							searchType : 0,
							mapMode : mapMode,
							stx1 : this.stx8,
							stx2 : this.stx2,
							sty1 : this.sty1,
							sty2 : this.sty2,
							barriers:this.szPointb
						},
						success : function(response) {
							var jsonResult = Ext.util.JSON
									.decode(response.responseText);
							var emapElement = jsonResult.points;
							var emapElementN = jsonResult.roadIdList;
							var emapElementW = jsonResult.simWay;
							this.netAnalyLen = jsonResult.length;
							shuzu1.length = 0;
							for (var i = 0, len = emapElementN.length; i < len; i++) {
								var szChildDataArray = [];
								szChildDataArray[0] = emapElementN[i];
								szChildDataArray[1] = emapElementW[i].theGeom;
								shuzu1.push(szChildDataArray);
							}
							if (this.linests.length != 0) {
								this.vector.removeFeatures(this.linests);
								this.linests.length = 0;
							}
							var stot = {
								params : {
									geom : emapElement
								}
							}
							this.store.load({
										params : {
											start : 0,
											limit : 100
										}
									});
							this.huaxianOS(stot);
							this.stx3 = ""
							mask.hide();
						}.createDelegate(this),
						failure : function(response) {
							Ext.Msg.alert('错误', '查询失败!');
						}
					}, this);
				} else {
					//Ext.Msg.alert("提示", "请先选择障碍点");
					return;
				}
				break
			default :
				break;
		}
	}
})
