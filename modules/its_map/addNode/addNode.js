/**
 * @description 添加监控点控件(现扩展为可添加监控点和输入输出设备)
 * @date 2011/05/16
 * @author zhangsl
 */
Ext.namespace('cms.emap');
cms.emap.addNode = function(config) {
	this.treeType = 0;
	this.mapId = 1;
	this.pos = {
		x : 0,
		y : 0
	};
	this.po = {
		x : 0,
		y : 0
	};
	this.addNodeUrl = '/ezEmapInfoAction!addMultiEmapElements.action';
	this.mapName = '上城区';
	cms.emap.addNode.superclass.constructor.call(this, config);
};
Ext.extend(cms.emap.addNode, Ext.ux.BaseControl, {
	controlItem : new cms.framework.map(),// 用来存储的子控件
	event : undefined,
	/**
	 * 创建控件
	 * 
	 * @param {}
	 * 
	 */
	getControl : function() {
		this.initTreePanel();
		this.initFormPanel();
		this.initView();
		return this.panel;
	},
	initTreePanel : function() {
		var treeLoaderUrl = '';
		this.tree = '';
		switch (parseInt(this.treeType, 10)) {
			case 0 :
				treeLoaderUrl = '/preview!getSubRegionAndCameraWithCheckBox.action';
				break;
			case 1 :// 报警输入
				treeLoaderUrl = '/ioInfo!getJsonArrayForInMonitorWithCheckBox.action';
				break;
			case 2 :// 报警输出
				treeLoaderUrl = '/ioInfo!getJsonArrayForOutMonitorWithCheckBox.action';
				break;
			case 3 :// 车载
				treeLoaderUrl = '/deviceInfo!getCarAndSimpleListTreeNodeWithCheckBox.action?elementTypeCode=5000';
				break;
			case 4 :// 单兵
				treeLoaderUrl = '/deviceInfo!getCarAndSimpleListTreeNodeWithCheckBox.action?elementTypeCode=5100';
				break;
			case 5 :// 卡口
				treeLoaderUrl = '/crossingConfigAction!getSubBayoneInfoTreeNodePrivilegeWithCheckBox.action';
				break;
			default :
				break
		}
		if (parseInt(this.treeType, 10) < 3) {
			this.tree = new Ext.ux.ChkboxTree({
						treeLoaderUrl : treeLoaderUrl,
						height : 350
					});
		} else if (parseInt(this.treeType, 10) >= 3
				&& parseInt(this.treeType, 10) <= 5) {
			this.tree = new Ext.ux.ChkTree({
						treeLoaderUrl : treeLoaderUrl,
						height : 350
					});
		}
		this.treePanelRegion = new Ext.Panel({
					region : 'center',
					border : false,
					frame : false,
					layout : 'fit',
					items : this.tree.getControl()
				});
	},
	initFormPanel : function() {
		var form = new cms.emap.propertyForm({
					title : '地图：' + this.mapName,
					listeners : {
						AddNodeFormEvent : this.addNodeFormEventHandler
								.createDelegate(this)
					}
				});
		this.controlItem.add('form', form);
	},
	initView : function() {
		this.description = new Ext.form.TextArea({
					region : 'south',
					emptyText : '请输入描述',
					height : 50,
					layout : 'fit'
				});
		this.formPanelRegion = new Ext.Panel({
					region : 'south',
					height : 140,
					layout : 'fit',
					items : [this.controlItem.get('form').getControl()]
				});
		this.panel = new Ext.Panel({
					layout : 'border',
					border : false,
					frame : false,
					items : [this.treePanelRegion/*
													 * , this.description ,
													 * this.formPanelRegion
													 */],
					buttons : [{
						text : '确定',
						handler : function() {
//							var fnPanel = mainCtrl.fnPanelItem.get('emap');
//							var addNodePanel = fnPanel.controlItem
//									.get('addNodePanel');
							var form = this.controlItem.get('form');
							form.confirmHandler();
						}.createDelegate(this)
					}, {
						text : '取消',
						handler : function() {
							var eventObject = {
								eventCode : 'Close',
								sender : this,
								params : {}
							};
							this.fireEvent(eventObject.eventCode, eventObject);
						}.createDelegate(this)
					}],
					buttonAlign : "right"
				});

	},
	getEleType : function() {
		var elementType, elementSubType;
		switch (parseInt(this.treeType, 10)) {
			case 0 :// 监控点
				elementType = 3000;
				elementSubType = this.tree.getSelectedNodeType();
				break;
			case 1 :// 报警输入
				elementType = 4000;
				elementSubType = '';
				break;
			case 2 :// 报警输出
				elementType = 4100;
				elementSubType = '';
				break;
			case 3 :// 车载
				elementType = 5000;
				elementSubType = '';
				break;
			case 4 :// 单兵
				elementType = 5100;
				elementSubType = '';
				break;
			case 5 :// 卡口
				elementType = 6000;
				elementSubType = '';
				break;
			default :
				elementType = 3000;
				elementSubType = '';
				break;
		}
		return {
			elementType : elementType,
			elementSubType : elementSubType
		};
	},
	saveNode : function() {
		var shapeXml = '<Shape><ShapeType>Point</ShapeType><Point><X>'
				+ this.pos.x + '</X><Y>' + this.pos.y + '</Y></Point></Shape>';
		var eleType = this.getEleType();
		this.event.params.data.BKGroundColor = this.event.params.data.BKGroundColor
				.removeStart('#');
		this.event.params.data.FontColor = this.event.params.data.FontColor
				.removeStart('#');
		if (this.tree.getSelectedNodesNames() == ""
				|| this.tree.getSelectedNodesIds() == "") {
			Ext.Msg.alert('提示', '没有节点被选中 ！');
			return;
		}
		// var descriptions="";
		// if(this.description.getValue()=="")
		// {
		// var typesub
		// // alert(nodeInfo.Point);
		// switch (parseInt(eleType.elementSubType)) {
		// case 0 :
		// typesub = "枪机";
		// break;
		// case 1 :
		// typesub = "半球";
		// break;
		// case 2 :
		// typesub = "快球";
		// break;
		// case 3 :
		// typesub = "云台";
		// break;
		// default :
		// typesub = "卡口";
		// break;
		// }
		// descriptions='<p/>' + "名称：" + this.tree.getSelectedNodesNames() +
		// '<p/>' + '<p/>' + "类型："
		// + typesub
		//			
		// }else{
		//		
		// descriptions=this.description.getValue();
		//		
		// }
		if (parseInt(this.treeType, 10) <= 3) {
		} else if (parseInt(this.treeType, 10) > 4
				&& parseInt(this.treeType, 10) <= 5) {
			this.po.x = this.po.x;
			this.po.y = this.po.y;
			this.pos.x = this.tree.getSelectedNodesLongitude();
			this.pos.y = this.tree.getSelectedNodesLatitude();
		}
		Ext.Ajax.request({
					url : this.addNodeUrl,
					success : this.addSuccess.createDelegate(this),
					failure : this.addFailure.createDelegate(this),
					params : {
						emapId : this.mapId,
						linkId : this.tree.getSelectedNodesIds(),
						elementName : this.tree.getSelectedNodesNames(),
						elementType : eleType.elementType,
						elementSubType : eleType.elementSubType,
						shapeXml : shapeXml,
						// description :this.description.getValue(),
						xmlRev : this.orgStyle(),
						latitude : this.pos.y,
						longitude : this.pos.x,
						la : this.po.y,
						lo : this.po.x
					}
				});
	},
	addNodeFormEventHandler : function(event) {
		this.event = event;
		switch (event.params.operate) {
			case 'ConfirmBtn' :
				this.saveNode();
				break;
			case 'CancelBtn' :
				var eventObject = {
					eventCode : 'Close',
					sender : this,
					params : {}
				};
				this.fireEvent(eventObject.eventCode, eventObject);
				break;
			default :
				break;
		}
	},
	/**
	 * 反转字符串工具类
	 */
	reverseString : function(color) {
		var rlt = '';
		for (var index = color.length - 1; index >= 0; --index) {
			rlt += color.substring(index, index + 1);
		}
		return rlt;
	},
	encodeC : function(color) {
		var rlt = parseInt(this.reverseString(color), 16);
		return rlt;
	},

	orgStyle : function() {

		// var param =
		// '<EleStyle><MapViewAngle><EleAngle>0</EleAngle><ViewAngle>0</ViewAngle>'
		// +
		// '<Radius>0</Radius><ViewBKColor></ViewBKColor><ViewBKTrans>255</ViewBKTrans></MapViewAngle>'
		// + '<BorderColor></BorderColor><BKGroundColor>'
		// + this.encodeC(this.event.params.data.BKGroundColor)
		// + '</BKGroundColor><Font><FontSize>'
		// + this.event.params.data.FontSize
		// + '</FontSize><FontColor>'
		// + this.encodeC(this.event.params.data.FontColor)
		// + '</FontColor></Font><BKTransparent>'
		// + this.event.params.data.BKTransparent
		// + '</BKTransparent><LineColor></LineColor><LineWidth></LineWidth>'
		// + '<ShowMarker></ShowMarker><MarkerColor></MarkerColor>'
		// + '<Include></Include><Exclude></Exclude></EleStyle>';
		var param = '<EleStyle>' + '<MapViewAngle>'
				+ '<EleAngle>225</EleAngle>' + '<ViewAngle>0</ViewAngle>'
				+ '<Radius>0</Radius>' + '<ViewBKColor>8421504</ViewBKColor>'
				+ '<ViewBKTrans>128</ViewBKTrans>' + '</MapViewAngle>'
				+ '<BorderColor>0</BorderColor>'
				+ '<BKGroundColor>16777088</BKGroundColor>' + '<Font>'
				+ '<FontSize>14</FontSize>' + '<FontColor>16711680</FontColor>'
				+ '</Font>' + '<BKTransparent>0</BKTransparent>'
				+ '<LineColor/>' + '<LineWidth>1</LineWidth>' + '<ShowMarker/>'
				+ '<MarkerColor/>' + '</EleStyle>';
		return param;
	},
	addFailure : function(response) {

	},
	addSuccess : function(response) {
		var respText = Ext.decode(response.responseText);
		if (response.status == 200 && response.statusText == "OK"
				&& respText.success == '1') {
			var data = {};
			var linkIds = this.tree.getSelectedNodesIds().split(',');
			var names = this.tree.getSelectedNodesNames().split(',');
			if (names == "" || linkIds == "") {
				cms.ext.alert('提示', '没有节点被选中 ！');
				return;
			}
			var ids = respText.emapElementInfoList;
			var type = this.getEleType();
			data.style = {
				bKGroundColor : this.event.params.data.BKGroundColor,
				fontSize : this.event.params.data.FontSize,
				fontColor : this.event.params.data.FontColor,
				bKTransparent : this.event.params.data.BKTransparent
			};
			data.pos = {};
			data.pos.x = this.pos.x;
			data.pos.y = this.pos.y;
			data.type = type;
			data.elements = [];
			var elementType = type.elementType, elementSubType = type.elementSubType;
			var elementSubTypes;
			if (elementType == 3000) {
				elementSubTypes = type.elementSubType.split(',');
			}
			for (var index = 0, len = linkIds.length; index < len; index++) {
				var el = {};
				el.id = ids[index];
				el.name = names[index];
				el.linkId = linkIds[index];
				el.elementType = type.elementType;
				if (el.elementType == 3000) {
					el.elementSubType = elementSubTypes[index];
				} else {
					el.elementSubType = '';
				}
				data.elements.push(el);
			}

			var eventObject = {
				eventCode : 'AddNodeEvent',
				sender : this,
				params : {
					operate : "ConfirmBtn",
					data : data
				}
			};
			this.fireEvent(eventObject.eventCode, eventObject);

		} else {
			cms.ext.alert('提示', '新增失败!');
		}
	}
});
