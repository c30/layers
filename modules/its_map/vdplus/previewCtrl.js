/**
 * @description 添加监控点的属性form,用于设置监控点的
 * @date 2010/08/16
 * @author lingshuang kong
 */
Ext.namespace('cms.emap');
cms.emap.previewCtrl = function(config) {
	this.previewUrl = 'preview!getCameraInfoForPreview.action';
	this.previewByGraphicUrl = 'preview!getCameraInfosForPreview.action';
	cms.emap.previewCtrl.superclass.constructor.call(this, config);
};
Ext.extend(cms.emap.previewCtrl, Ext.ux.BaseControl, {
	wndInfoMap : new cms.framework.map(),
	previewRegion : undefined,
	cameraId : undefined,
	playOCXObj : undefined,
	playOk : -1,
	previewType : undefined,// 0为双击监控点预览；1为框选预览，2为双击框选框一行
	/**
	 * 创建控件
	 * 
	 * @param {}
	 * 
	 */
	getControl : function() {
		this.previewRegion = new Ext.Panel({
			border : false,
			frame : false,
			html : '<object classid="clsid:D5E14042-7BF6-4E24-8B01-2F453E8154D7" id="RealTimePlayOcx" width="100%" height="100%" name="RealTimePlayOcx" ></object>',
			listeners : {
				afterrender : this.afterRenderHandler.createDelegate(this)
			}
		});
		return this.previewRegion;

	},
	afterRenderHandler : function() {
		this.cachePreviewObj();
		window.onbeforeunload = function() {
			this.playOCXObj.Destroy();
		}.createDelegate(this);
	},
	setOcxMode : function() {
		var flag = this.playOCXObj.SetOcxMode(0);
		if (flag == -1) {
			util.setTimeout(this.setOcxMode.createDelegate(this), 0);
		} else {
			this.playOCXObj.SetWndNum(1);
			this.playOCXObj.IsShowToolBar(1);
			var eventObject = {
				eventCode : 'PreviewCtrlEvent',
				sender : this,
				params : {
					operate : 'OcxRender'
				}
			};
			this.fireEvent(eventObject.eventCode, eventObject);
		}
		// this.setWndNum(1);
	},
	setWndNum : function(num) {
		var winNum;
		if (0 == num) {
			winNum = 1;
		} else if (0 < num && num <= 1) {
			winNum = 1;
		} else if (1 < num && num <= 4) {
			winNum = 4;
		} else if (4 < num && num <= 6) {
			winNum = 6;
		} else if (6 < num && num <= 8) {
			winNum = 8;
		} else if (8 < num && num <= 9) {
			winNum = 9;
		} else if (9 < num && num <= 10) {
			winNum = 10;
		} else if (10 < num && num <= 13) {
			winNum = 13;
		} else if (13 < num && num <= 14) {
			winNum = 14;
		} else if (14 < num && num <= 16) {
			winNum = 16;
		} else if (16 < num && num <= 17) {
			winNum = 17;
		} else if (17 < num && num <= 22) {
			winNum = 22;
		} else if (22 < num && num <= 25) {
			winNum = 25;
		} else if (num > 25) {
			winNum = 25;
		}
		this.playOCXObj.SetWndNum(winNum);
	},

	cachePreviewObj : function() {
		this.playOCXObj = document.getElementById("RealTimePlayOcx");
		this.playOCXObj.SetWndNum(1);
		this.setOcxMode();
	},
	previewHandler : function(cameraId) {
		Ext.Ajax.request({
					url : this.previewUrl,
					success : this.previewSuccess.createDelegate(this),
					failure : this.previewFailure.createDelegate(this),
					params : {
						cameraId : cameraId
					}
				});

	},
	setPreviewType : function(type) {
		this.previewType = type;
	},
	/**
	 * 
	 * @param {}
	 *            cameraIds
	 */
	previewGraphicHandler : function(preCameraIds) {
		Ext.Ajax.request({
					url : this.previewByGraphicUrl,
					success : this.previewByGraphicSuccess.createDelegate(this),
					failure : this.previewByGraphicFailure.createDelegate(this),
					params : {
						preCameraIds : preCameraIds
					}
				});

	},
	previewByGraphicSuccess : function(response) {
		var result = response.responseText;
		var retObjArray = [];
		try {
			retObjArray = Ext.decode(result);
		} catch (e) {
			return;
		}
		if (Ext.isArray(retObjArray)) {
			for (var index = 0; index < retObjArray.length; index++) {
				retObj = retObjArray[index];
				if (!retObj.result) {
					continue;
				} else {
					switch (1) {
						case 1 :
							this.setWndNum(retObjArray.length);
							this.wndInfoMap.add({
										winNum : index
									}, retObj);
							this.startPlay(retObj, index);
							break;
						case 2 :
							var hasCamera = false;
							for (var j = 0, len = this.wndInfoMap.count(); j < len; j++) {
								var cameraInfo = this.wndInfoMap.getByIndex(j);
								if (cameraInfo.cameraId == retObj.cameraId) {
									hasCamera = true;
									var winNum = this.wndInfoMap
											.getKeyByIndex(j).winNum;
									this.playOCXObj.IsWndPreview(winNum) == -1
											&& this.startPlay(retObj, winNum);
									this.playOCXObj.SelWindow(winNum);
									break;
								}
							}
							if (hasCamera == false) {
								this.setWndNum(1);
								this.stopAllPreview();
								this.cleanWndInfoMap();
								this.wndInfoMap.add({
											winNum : 0
										}, retObj);
								this.startPlay(retObj, 0);
							}
							break;
						default :
							break;
					}
				}
			}
		}

	},
	stopAllPreview : function() {
		this.playOCXObj.StopAllPreview();
	},
	cleanWndInfoMap : function() {
		this.wndInfoMap.removeAll();
	},
	previewByGraphicFailure : function() {
	},
	previewSuccess : function(response) {
		var result = response.responseText;
		var retObjArray = [];
		try {
			retObjArray = Ext.decode(result);
		} catch (e) {
			return;
		}
		retObj = retObjArray[0];
		this.setWndNum(1);
		this.startPlay(retObj, 0);
	},
	previewFailure : function() {
	},
	setPtzRight : function() {
		this.playOCXObj.SetPreviewRight(0, 0, 1);
	},
	clearPtzRight : function() {
		this.playOCXObj.SetPreviewRight(0, 0, 0);
	},
	setRecordRight : function() {
		this.playOCXObj.SetPreviewRight(0, 1, 1);
	},
	clearRecordRight : function() {
		this.playOCXObj.SetPreviewRight(0, 1, 0);
	},
	startPlay : function(cameraInfo, wndIndex) {
		var xmlDoc = this.buildPlayXml(cameraInfo);
		var priPtz = cameraInfo.ptzPri;
		var priRecord = cameraInfo.localRecordPri;

		if (priPtz) {
			this.setPtzRight();
		} else {
			this.clearPtzRight();
		}

		if (priRecord) {
			this.setRecordRight();
		} else {
			this.clearRecordRight();
		}
		this.playOk = this.playOCXObj.StartTask_Preview_InWnd(xmlDoc, wndIndex);
		if (this.playOk == -1) {
			util.setTimeout(this.startPlay.createDelegate(this), 200,
					cameraInfo, wndIndex);
		}
		// else{
		// this.playOCXObj.SelWindow(wndIndex);
		// }
	},
	setPtzRight : function() {
		this.playOCXObj.SetPreviewRight(0, 0, 1);
	},
	clearPtzRight : function() {
		this.playOCXObj.SetPreviewRight(0, 0, 0);
	},
	setRecordRight : function() {
		this.playOCXObj.SetPreviewRight(0, 1, 1);
	},
	clearRecordRight : function() {
		this.playOCXObj.SetPreviewRight(0, 1, 0);
	},
	/**
	 * 构造预览需要的xml字串
	 * 
	 * @return
	 */
	buildPlayXml : function(retObj) {
		var XmlDoc = new ActiveXObject("MSXML2.DOMDocument");
		var Instruction = XmlDoc.createProcessingInstruction("xml",
				"version='1.0' encoding='utf-8'");
		XmlDoc.appendChild(Instruction);

		var Root = XmlDoc.createNode(1, "Parament", "");

		Element = XmlDoc.createElement("MatrixCode");
		Element.text = retObj.matrixCode;
		Root.appendChild(Element);

		Element = XmlDoc.createElement("MonitorID");
		Element.text = retObj.monitorId;
		Root.appendChild(Element);

		Element = XmlDoc.createElement("CameraID");
		Element.text = retObj.cameraId;
		Root.appendChild(Element);

		Element = XmlDoc.createElement("CameraName");
		Element.text = retObj.cameraName;
		Root.appendChild(Element);

		Element = XmlDoc.createElement("DeviceIP");
		Element.text = retObj.deviceIp;
		Root.appendChild(Element);

		Element = XmlDoc.createElement("DevicePort");
		Element.text = retObj.devicePort;
		Root.appendChild(Element);

		Element = XmlDoc.createElement("DeviceType");
		Element.text = retObj.deviceType;
		Root.appendChild(Element);

		Element = XmlDoc.createElement("GUID");
		Element.text = retObj.cameraIndexCode;
		Root.appendChild(Element);
		// pag
		Element = XmlDoc.createElement("RegistType");
		Element.text = retObj.registType;
		Root.appendChild(Element);

		Element = XmlDoc.createElement("DeviceID");
		Element.text = retObj.deviceId;
		Root.appendChild(Element);
		// end

		Element = XmlDoc.createElement("User");
		Element.text = retObj.user;
		Root.appendChild(Element);

		Element = XmlDoc.createElement("Password");
		Element.text = retObj.password;
		Root.appendChild(Element);

		Element = XmlDoc.createElement("ChannelNum");
		Element.text = retObj.channelNum;
		Root.appendChild(Element);

		Element = XmlDoc.createElement("ProtocolType");
		Element.text = retObj.protocolType;
		Root.appendChild(Element);

		Element = XmlDoc.createElement("StreamType");
		Element.text = retObj.streamType;
		Root.appendChild(Element);

		if (retObj.isUseStreamServer) {
			Element = XmlDoc.createElement("Transmits");
			Root.appendChild(Element);

			var trsEle = XmlDoc.createElement("Transmit");
			Element.appendChild(trsEle);

			var steEle = XmlDoc.createElement("SrvIp");
			steEle.text = retObj.streamServerIp;
			trsEle.appendChild(steEle);

			steEle = XmlDoc.createElement("Port");
			steEle.text = retObj.streamServerPort;
			trsEle.appendChild(steEle);
		}

		// 级联
		if (retObj.isUseCascade) {
			Element = XmlDoc.createElement("CascadeType");
			Element.text = retObj.cascadeType;
			Root.appendChild(Element);

			Element = XmlDoc.createElement("CameraIndexCode");
			Element.text = retObj.cameraIndexCode;
			Root.appendChild(Element);

			Element = XmlDoc.createElement("CascadeServerIp");
			Element.text = retObj.cascadeServerIp;
			Root.appendChild(Element);

			Element = XmlDoc.createElement("CascadeServerPort");
			Element.text = retObj.cascadeServerPort;
			Root.appendChild(Element);

			Element = XmlDoc.createElement("CmsCascadeId");
			Element.text = retObj.cmsCascadeId;
			Root.appendChild(Element);
		} else {
			Element = XmlDoc.createElement("CascadeType");
			Element.text = '0';
			Root.appendChild(Element);
		}

		XmlDoc.appendChild(Root);

		return XmlDoc.xml;
	}
});
var util = {
	setTimeout : function(fun, delay) {
		if (typeof fun == 'function') {
			var argu = Array.prototype.slice.call(arguments, 2);
			var f = (function() {
				fun.apply(null, argu);
			});
			return window.setTimeout(f, delay);
		}
		return window.setTimeout(fun, delay);
	}
}
