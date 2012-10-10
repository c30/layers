/**
 * @description 实时过车信息Form
 * @date 2011/05/20
 * @author zhou xiaolong
 */
Ext.namespace('cms.emap');
cms.emap.carPicMonitorForm = function(config) {
	cms.emap.carPicMonitorForm.superclass.constructor.call(this, config);
};

Ext.extend(cms.emap.carPicMonitorForm, Ext.ux.BaseControl, {
	m_szPassCarData : [],
	m_szWarningCarData : [],

	/**
	 * 创建控件
	 * 
	 * @param {}
	 * 
	 */
	getControl : function() {

		/**
		 * 图片
		 */
		var picRegion = '<div id="picDiv"><script type="text/javascript" for="SeeChanPicOCX" event="GetAlarmInfo(szXmlInfo)">getAlarmInfo(szXmlInfo)</script><script type="text/javascript" for="SeeChanPicOCX" event="ShowCarDetail(szXmlInfo)">showCarDetail(szXmlInfo)</script><object classid="clsid:E99BEA96-EA12-4669-88D9-5D6300F9C38E" standby="Waiting..." id="SeeChanPicOCX" width ="100%" height ="100%" name="SeeChanPicOCX"></object></div>';
		picRegion = picRegion
				+ '<script type="text/javascript" for="SeeChanPicOCX" event="FireLinkToServerFinish(szXmlInfo)">linkToServerFinish(szXmlInfo)</script>';
		picRegion = picRegion
				+ '<script type="text/javascript" for="SeeChanPicOCX" event="FireGetSectionAlarmInfo(szXmlInfo)">getSectionAlarmInfo(szXmlInfo)</script>';
		// picRegion = picRegion
		// + '<div style="display:none">'
		// + '<object id="ActiveMovie1" width="450px" height="320px"
		// classid="CLSID:6BF52A52-394A-11D3-B153-00C04F79FAA6"
		// name="ActiveMovie1">'
		// + '<param name="URL" value="music/qiangche.wav">'
		// + '<param name="rate" value="1">'
		// + '<param name="balance" value="0">'
		// + '<param name="currentPosition" value="0">'
		// + '<param name="defaultFrame" value>'
		// + '<param name="playCount" value="3">'
		// + '<param name="autoStart" value="1">'
		// + '<param name="currentMarker" value="0">'
		// + '<param name="invokeURLs" value="1">'
		// + '<param name="baseURL" value>'
		// + '<param name="volume" value="100">'
		// + '<param name="mute" value="0">'
		// + '<param name="uiMode" value="full">'
		// + '<param name="stretchToFit" value="0">'
		// + '<param name="windowlessVideo" value="0">'
		// + '<param name="enabled" value="1">'
		// + '<param name="enableContextMenu" value="1">'
		// + '<param name="fullScreen" value="0">'
		// + '<param name="SAMIStyle" value>'
		// + '<param name="SAMILang" value>'
		// + '<param name="SAMIFilename" value>'
		// + '<param name="captioningID" value>'
		// + '<param name="enableErrorDialogs" value="0">'
		// + '<param name="_cx" value="7779">'
		// + '<param name="_cy" value="1693">' + '</object></div>';

		this.panel = new Ext.Panel({
					border : true,
					frame : false,
					width : '100%',
					id : 'picPanel',
					height : 310,
					html : picRegion,
					listeners : {
						afterrender : function() {
							var m_szOCXControl = document
									.getElementById("SeeChanPicOCX");
							m_szOCXControl.SetWindowNum(1);
						}
					}
				});

		// 上部编辑面板
		this.form = new Ext.form.FormPanel({
			// columnWidth : .60,
			id : 'picForm',
			collapseMode : 'mini',
			split : true,
			labelAlign : 'left',
			region : 'north',
			// height : 500,
			// width : "100%",
			border : false,
			frame : false,
			height : 310,
			labelWidth : 72,
			items : [this.panel]
				/*
				 * , listeners : { //afterRender :
				 * this.initField.createDelegate(this) resize :
				 * this.resizeReportHandler.createDelegate(this) }
				 */
			});
		return this.form;
	},

	resizeReportHandler : function(p, width, height) {
		var w = width - 100;
		var h = height - 120;

		// alert(width+" "+ height);
		if (w > 700) {
			w = 700;
		} else if (w < 250) {
			w = 250;
		}
		if (h > 350) {
			h = 350;
		} else if (h < 125) {
			h = 125;
		}

		// document.getElementById("SeeChanPicOCX").
		// this.panel.setSize(width-2,height-30);

		if (Ext.isIE) {
			if (Ext.get('ext-gen87')) {
				// Ext.get('ext-gen87').setWidth(w);
				// Ext.get('ext-gen87').setHeight(h);
			}
		} else {
			if (Ext.get('ext-gen83')) {
				// Ext.get('ext-comp-1034').setWidth(width - 80);
				// Ext.get('ext-comp-1034').setHeight(height - 100);
				// Ext.get('ext-gen83').setWidth(width - 80);
				// Ext.get('ext-gen83').setHeight(height - 100);
			}
		}
	}
});
