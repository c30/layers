var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
var m_szPassCarData = []; // 实时正在过车信息
var m_szWarningCarData = []; // 实时违章过车信息
var m_szQuJianAlarmData = []; // 实时违章过车信息
var alarmServerArray = []; // 报警服务器连接信息
var subscribeServerArray = []; // 订阅服务器连接信息
var quJianServerArray = []; // 区间服务器连接信息
var m_iMaxlist = 100; // 客户端过车信息最大显示数目，超过全部清空
var m_selTabId = 0; // 选中得Tab页编
var m_sz_gridWidth = 0; // grid长度
var m_sz_gridHeight = 190; // grid高度
var isSelected = false; // 是否鼠标在列表上
var selRowIndex = -1; // 选定的行id
var selRowTop = -1; // 选定的行滚动条的位置
var m_szAlarmMusicData = []; // 数组存储声音文件信息
var msz_menuFlag = 0; // 0表示实时过车监控，1表示实时视频监控

var m_bEnableAlarmSound = false;// 是否启用声音报警
var selectedCrosslsh = ""; // 订阅的路口
var crossSelectWin = ""; // 订阅窗口
var lastDbClickNodeId = ""; // 双击的树节点ID
var windowNum = 0;
var lastServerInfoArray = [];
var windowNodeIdArray = [];
var playLaneCount = 0;
var pssremove = "";
var isDestory = false;
// 初始化
for (var i = 0; i < 25; i++) {
	lastServerInfoArray.push("");
	windowNodeIdArray.push("");
}

// 重载滚动条滚动函数
Ext.override(Ext.grid.GridView, {
			scrollToTop : Ext.emptyFn
		});

function getAlarmInfo(szXml) {
	// if (isDestory) {
	// return;
	// }
	// alert(szXml);
	// var szXml="<?xml version ='1.0'?><a><b><1>1</1></b></a>";
	if(ezPort[2].split(",")[2]=="2.4")
	{
	try
	{
	    analysisXml(szXml);
	}
	catch(e)
	{
		alert(e.description);
	}
	return;	
	}
	try {
		// 计数器递增
		var szChildDataArray = [];

		xmlDoc.async = "false";
		xmlDoc.loadXML(szXml);
		var docChildNodes = []; // 解析xml数组存放
		// 取XML中各结点值{路口流水号,路口编号,车牌号码,车牌类型,车辆类型,车速,限速,时间,地点,方向编号,车道号,车牌颜色,违法行为,违法行为名称,车身颜色,过车流水号,路口名称,方向名称,车身长度,车身图片路径,车牌图片路径,报警流水号,报警原因ID,报警预案名称}
		for (i = 0; i < 24; i++) {
			try {
				isHasChild = xmlDoc.documentElement.childNodes[i]
						.hasChildNodes();
				docChildNodes
						.push(isHasChild
								? xmlDoc.documentElement.childNodes[i].childNodes[0].nodeValue
								: '');
			} catch (err) {
				docChildNodes.push(0);
			}
		}

		if (docChildNodes[12] == "") {
			docChildNodes[12] = -1;
		}

		// 保存违法行为code
		var temp = docChildNodes[12];
		// var xmlReturn = eval('('+ajaxObj.responseText+')');

		szChildDataArray[18] = docChildNodes[14]; // 车辆颜色
		szChildDataArray[19] = docChildNodes[11]; // 车牌颜色
		szChildDataArray[20] = docChildNodes[4]; // 车辆类型
		szChildDataArray[21] = docChildNodes[3]; // 车牌类型
		szChildDataArray[22] = docChildNodes[21]; // 布控流水号
		szChildDataArray[23] = docChildNodes[12]; // 违法行为ID
		if(judgeLicParams(PRIVILEGE_CODE_8610)){
			if(!(szChildDataArray[23] == 0||szChildDataArray[23] == 6 || szChildDataArray[23] == 12 || szChildDataArray[23] == 13)){
				return;
			}
		}
		docChildNodes[3] = bay.common.getPlateType(docChildNodes[3]);// xmlReturn.plateType;
		docChildNodes[4] = bay.common.getVehicleType(docChildNodes[4]);// xmlReturn.vehicleType;
		docChildNodes[11] = bay.common.getPlateColor(docChildNodes[11]);// xmlReturn.plateColor;
		docChildNodes[14] = bay.common.getVehicleColor(docChildNodes[14]);// xmlReturn.vehicleColor;
		// docChildNodes[12] = docChildNodes[12];//xmlReturn.alarmAction;
		// docChildNodes[17] = docChildNodes[23];//xmlReturn.alarmWay;

		var musicPath = bay.common.getMusicPath(docChildNodes[12],
				docChildNodes[21], docChildNodes[22]);

		// 如果有报警声音
		if (musicPath != "") {
			m_szAlarmMusicData.push(musicPath);
		}

		// 车身长度分米转换为米
		if (docChildNodes[18] != "") {
			docChildNodes[18] = parseFloat(parseInt(docChildNodes[18]) / 10);
		}
		// 查询报警预案名称
		try {
			if (docChildNodes[12] != '0' && docChildNodes[12] != '2') {
				// 根据违法行为字段设置记录字体颜色（除掉车辆流水号，车牌图片url,车辆图片url）
				for (i = 1; i < 24; i++) {
					if (i != 20) {
						docChildNodes[i] = '<font color=#FF0000>'
								+ docChildNodes[i] + '</font>';
					}
				}

				// 插入违法过车信息
				// var szChildDataArray = [];
				szChildDataArray[0] = docChildNodes[20];// 车牌图片
				szChildDataArray[1] = docChildNodes[7]; // 过车时间
				szChildDataArray[2] = docChildNodes[16];// 路口名称
				szChildDataArray[3] = docChildNodes[2]; // 车牌号码
				szChildDataArray[4] = docChildNodes[5]; // 车速
				szChildDataArray[5] = docChildNodes[6]; // 限速
				szChildDataArray[6] = docChildNodes[13];// 违法行为
				szChildDataArray[7] = docChildNodes[10];// 车道号
				szChildDataArray[8] = docChildNodes[14];// 车辆颜色
				szChildDataArray[9] = docChildNodes[11];// 车牌颜色
				szChildDataArray[10] = docChildNodes[4];// 车辆类型
				szChildDataArray[11] = docChildNodes[3];// 车牌类型
				szChildDataArray[12] = docChildNodes[17];// 方向名称
				szChildDataArray[13] = docChildNodes[15];// 车辆流水号
				szChildDataArray[14] = docChildNodes[23];// 报警预案
				szChildDataArray[15] = docChildNodes[18];// 车身长度
				szChildDataArray[16] = docChildNodes[19];// 车辆图片
				szChildDataArray[17] = docChildNodes[0]; // 路口流水号
				// oldArray.slice(0);

				// m_szWarningCarData.push(szChildDataArray);
				 m_szPassCarData.push(szChildDataArray);
			} else {
				docChildNodes[17] = "";

				// 插入过车信息

				szChildDataArray[0] = docChildNodes[20];// 车牌图片
				szChildDataArray[1] = docChildNodes[7]; // 过车时间
				szChildDataArray[2] = docChildNodes[16];// 路口名称
				szChildDataArray[3] = docChildNodes[2]; // 车牌号码
				szChildDataArray[4] = docChildNodes[5]; // 车速
				szChildDataArray[5] = docChildNodes[6]; // 限速
				szChildDataArray[6] = docChildNodes[13];// 违法行为
				szChildDataArray[7] = docChildNodes[10];// 车道号
				szChildDataArray[8] = docChildNodes[14];// 车辆颜色
				szChildDataArray[9] = docChildNodes[11];// 车牌颜色
				szChildDataArray[10] = docChildNodes[4];// 车辆类型
				szChildDataArray[11] = docChildNodes[3];// 车牌类型
				szChildDataArray[12] = docChildNodes[17];// 方向名称
				szChildDataArray[13] = docChildNodes[15];// 车辆流水号
				szChildDataArray[14] = ""; // 报警预案
				szChildDataArray[15] = docChildNodes[18];// 车身长度
				szChildDataArray[16] = docChildNodes[19];// 车辆图片
				szChildDataArray[17] = docChildNodes[0]; // 路口流水号

				m_szPassCarData.push(szChildDataArray);
			}
		} catch (err) {
			cms.ext.alert('提示', err.description);
		}

		delete(docChildNodes);
		delete(szChildDataArray);

	} catch (err) {
		cms.ext.alert('提示', err.description);
	}

	// alert(m_szPassCarData.length);
}

/**
 * 设置订阅连接报警服务器信息
 */
function getsubscribeServer() {
	// this.cloneAll(this.alarmServerArray,this.subscribeServerArray);
	// this.subscribeServerArray = this.alarmServerArray.slice(0);

	for (i = 0; i < subscribeServerArray.length; i++) {
		subscribeServerArray[i].subCrosslsh = "";
	}

	// 如果没有订阅任何路口
	if (selectedCrosslsh == "") {
		return;
	}

	var selectedArrayList = selectedCrosslsh.split(",");

	for (j = 0; j < selectedArrayList.length; j++) {
		for (i = 0; i < alarmServerArray.length; i++) {
			if (("," + alarmServerArray[i].crosslsh + ",").indexOf(","
					+ selectedArrayList[j] + ",") >= 0) {

				if (subscribeServerArray[i].subCrosslsh == "") {
					subscribeServerArray[i].subCrosslsh = selectedArrayList[j];
				} else {
					subscribeServerArray[i].subCrosslsh = subscribeServerArray[i].subCrosslsh
							+ "," + selectedArrayList[j];
				}

				break;
			}
		}
	}
}

/**
 * 连接报警服务器
 */
function linkServer(flag) {
	// isDestory = false;
	m_szOCXControl = document.getElementById("SeeChanPicOCX");
	if (m_szOCXControl.object == null) {
		cms.ext.alert('提示', "请下载并安装控件！");
		return;
	}

	try {
		m_szOCXControl.SetIVMSType(top.crossingManageName); // 设置显示
		m_szOCXControl.SetIVMSType("20"); // 设置显示毫秒

		var crossNum = 0;
		var crossLshArray = [];
		var subCrossNum = 0;
		var subCrossLshArray = [];
		var XmlDoc = new ActiveXObject("MSXML2.DOMDocument");
		var Instruction = XmlDoc.createProcessingInstruction("xml",
				"version='1.0' encoding='utf-8'");
		XmlDoc.appendChild(Instruction);
		var Root = XmlDoc.createNode(1, "RequestAllInfo", "");

		var alarmServerInfosRoot = XmlDoc.createNode(1, "AlarmServerInfos", ""); // //请求报警服务器

		Element = XmlDoc.createElement("AlarmServerCount"); // //请求报警服务器
		Element.text = subscribeServerArray.length;
		alarmServerInfosRoot.appendChild(Element);

		for (i = 0; i < subscribeServerArray.length; i++) {
			var alarmServerInfoRoot = XmlDoc.createNode(1, "AlarmServerInfo",
					"");
			Element = XmlDoc.createElement("RequestType"); // //请求报警服务器
			Element.text = 0;
			alarmServerInfoRoot.appendChild(Element);

			Element = XmlDoc.createElement("ServerIP");
			Element.text = subscribeServerArray[i].serverIp;
			alarmServerInfoRoot.appendChild(Element);

			Element = XmlDoc.createElement("ServerPort");
			Element.text = subscribeServerArray[i].serverPort;
			alarmServerInfoRoot.appendChild(Element);

			Element = XmlDoc.createElement("ServerName");
			Element.text = subscribeServerArray[i].serverName;
			alarmServerInfoRoot.appendChild(Element);

			var szCrossingInfo = XmlDoc.createNode(1, "AllCrossingInfo", "");

			if (subscribeServerArray[i].crosslsh == "") {
				crossNum = 0;
			} else {
				crossLshArray = subscribeServerArray[i].crosslsh.split(",");
				crossNum = crossLshArray.length;
			}

			Element = XmlDoc.createElement("CrossingNum");
			Element.text = crossNum;
			szCrossingInfo.appendChild(Element);

			for (j = 0; j < crossNum; j++) {
				Element = XmlDoc.createElement("CrossingLsh");
				Element.text = crossLshArray[j];
				szCrossingInfo.appendChild(Element);
			}

			alarmServerInfoRoot.appendChild(szCrossingInfo);
			alarmServerInfosRoot.appendChild(alarmServerInfoRoot);

			// iRetValue =
			// m_szOCXControl.LinkToServerEX(this.alarmServerArray[i].serverIp,this.alarmServerArray[i].serverPort,XmlDoc.xml);

			// 连接报警服务器失败
			// if(iRetValue < 0)
			// {
			// ShowRtimeWindows("连接报警服务器失败","","名称: "+
			// this.alarmServerArray[i].serverName);
			// }
		}

		Root.appendChild(alarmServerInfosRoot);

		// 初始化，需要连接区间测速服务器，订阅则不需要
		if (flag == 0) {
			var sectionServerInfosRoot = XmlDoc.createNode(1,
					"SectionServerInfos", ""); // //请求报警服务器

			Element = XmlDoc.createElement("SectionServerCount"); // //请求报警服务器
			Element.text = quJianServerArray.length;
			sectionServerInfosRoot.appendChild(Element);

			for (i = 0; i < quJianServerArray.length; i++) {
				var sectionServerInfoRoot = XmlDoc.createNode(1,
						"SectionServerInfo", "");

				Element = XmlDoc.createElement("ServerIP");
				Element.text = quJianServerArray[i].serverIp;
				sectionServerInfoRoot.appendChild(Element);

				Element = XmlDoc.createElement("ServerPort");
				Element.text = quJianServerArray[i].serverPort;
				sectionServerInfoRoot.appendChild(Element);

				Element = XmlDoc.createElement("ServerName");
				Element.text = quJianServerArray[i].serverName;
				sectionServerInfoRoot.appendChild(Element);

				var sectionInfoRoot = XmlDoc.createNode(1, "SectionInfo", "");

				var quJianLshArray = quJianServerArray[i].quJianLsh.split(",");
				var quJianNum = quJianLshArray.length;

				Element = XmlDoc.createElement("SectionNum");
				Element.text = quJianNum;
				sectionInfoRoot.appendChild(Element);

				for (j = 0; j < quJianNum; j++) {
					Element = XmlDoc.createElement("SectionLsh");
					Element.text = quJianLshArray[j];
					sectionInfoRoot.appendChild(Element);
				}

				sectionServerInfoRoot.appendChild(sectionInfoRoot);
				sectionServerInfosRoot.appendChild(sectionServerInfoRoot);

				// iRetValue =
				// m_szOCXControl.LinkToServerEX(this.alarmServerArray[i].serverIp,this.alarmServerArray[i].serverPort,XmlDoc.xml);

				// 连接报警服务器失败
				// if(iRetValue < 0)
				{
					// ShowRtimeWindows("连接报警服务器失败","","名称: "+
					// this.alarmServerArray[i].serverName);
				}
			}
			Root.appendChild(sectionServerInfosRoot);
		}
		XmlDoc.appendChild(Root);

		// 初始化
		if (flag == 0) {
			cms.ext.alert('提示', XmlDoc.xml);
			m_szOCXControl.LinkToAllServer(XmlDoc.xml);
		}
		// 保存订阅
		else {
			cms.ext.alert('提示', XmlDoc.xml);
			m_szOCXControl.SubBayonetInfo(XmlDoc.xml);
		}
	} catch (err) {
		// alert(err.description);
	}
}

/**
 * @function getSectionAlarmInfo
 * @description 获取区间测速违章车辆信息
 * @param szXml
 * @return
 */
function getSectionAlarmInfo(szXml) {
	// 计数器递增
	var szChildDataArray = [];

	xmlDoc.async = "false";
	xmlDoc.loadXML(szXml);
	var docChildNodes = []; // 解析xml数组存放
	// 取XML中各结点值{卡口编号,车辆编号,车牌号码,车牌类型,车辆类型,车速,限速,时间,地点,方向编号,图片路径,图片名称,车道号,车牌颜色,违法行为,车身颜色,过车流水号,路口名称,方向名称,报警流水号,车身长度}
	for (i = 0; i < 8; i++) {
		try {
			isHasChild = xmlDoc.documentElement.childNodes[i].hasChildNodes();
			docChildNodes
					.push(isHasChild
							? xmlDoc.documentElement.childNodes[i].childNodes[0].nodeValue
							: '');
		} catch (err) {
			docChildNodes.push(0);
		}
	}

	// 根据车牌类型设置车牌类型
	docChildNodes[1] = bay.common.getPlateType(docChildNodes[1]);

	m_szQuJianAlarmData.push(docChildNodes);
}

/**
 * @function showCarDetail
 * @description 显示车辆详情
 * @param szXml
 * @return
 */
function showCarDetail(szXml) {
	// if(szXml != "")
	// {
	// try
	// {
	// //alert(szXmlInfo);
	// var iLsh = 0;
	// var isAlarm = 0;
	// xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
	// xmlDoc.async="false";
	// xmlDoc.loadXML(szXml);
	// if(xmlDoc.documentElement.childNodes[7].hasChildNodes()) //卡口编号
	// {
	// iLsh = xmlDoc.documentElement.childNodes[7].childNodes[0].nodeValue;
	// }
	//			
	// if(xmlDoc.documentElement.childNodes[8].hasChildNodes()) //卡口编号
	// {
	// isAlarm = xmlDoc.documentElement.childNodes[8].childNodes[0].nodeValue;
	// }
	//			
	// if(iLsh > 0)
	// {
	// // 正常车
	// if(isAlarm == 0)
	// {
	// getCarDetailInfoWin(iLsh,"vehicleGird","001",0); //弹出图片详细
	// }
	// // 违章车
	// else
	// {
	// getCarDetailInfoWin(iLsh,"warningCarPassInfoGrid","011",1); //弹出图片详细
	// }
	// }
	// }
	// catch(err)
	// {
	// //alert(err.description);
	// }
	// }
}

/*******************************************************************************
 * Function: TryGetPassCarInfo Description: 定时去数组获取获取过车信息并显示 Input: bShow:
 * 1,0是否显示 Output: 无 Return: 无
 ******************************************************************************/
function TryGetPassCarInfo() {
	if (isDestory) {
		return;
	}

	// 如果点击实时视频监控的时候，不处理
	if (msz_menuFlag == 1) {
		return;
	}

	try {
		// if (m_szPassCarData.length == 0) {
		// setTimeout("TryGetPassCarInfo()", 2000);
		// return;
		// }

		var vehiclePassInfoGrid = Ext.getCmp("vehicleGird");
		// 如果记录超过固定值，清零
		if (vehiclePassInfoGrid.getStore().getCount() >= m_iMaxlist) {
			// m_iDynamicUpdateTotal = 0;
			vehiclePassInfoGrid.getStore().removeAll();
		}

		if (m_szPassCarData.length != 0) {
			vehiclePassInfoGrid.getStore().loadData(m_szPassCarData, true);
		}

		// 如果可以选定正常过车信息某行，滚动条不滚动
		if (m_szPassCarData.length != 0) {
			if (isSelected) {
				// 选定了某行，则滚动条不滚动
				if (selRowIndex > -1) {
					vehiclePassInfoGrid.getView().focusRow(selRowIndex);// 指定行
					vehiclePassInfoGrid.getSelectionModel()
							.selectRow(selRowIndex);
				}

				vehiclePassInfoGrid.getView().scroller.dom.scrollTop = selRowTop;
			} else {
				vehiclePassInfoGrid.getView().scroller.dom.scrollTop = (vehiclePassInfoGrid
						.getStore().getCount() - 5)
						* 21;
			}
		}

		m_szPassCarData.length = 0;
	} catch (err) {
		cms.ext.alert('提示', err.description);
	}
	pssremove = setTimeout("TryGetPassCarInfo()", 2000);
}
/**
 * @author zhangsl
 * @date : 2011-6-25 下午02:08:32
 * @description:取消循环
 */
function RemovePassCarInfo() {
	isDestory = true;
	clearTimeout(pssremove);
}
function RemoveInfo() {
	isDestory = false;
	m_szPassCarData.length = 0;
	var vehiclePassInfoGridremove = Ext.getCmp("vehicleGird");
	vehiclePassInfoGridremove.getStore().removeAll();
}
/*******************************************************************************
 * Function: TryGetWarningPassCarInfo Description: 定时去数组获取获取过违法过车信息并显示 Output: 无
 * Return: 无
 ******************************************************************************/
function TryGetWarningPassCarInfo() {
	// 如果点击实时视频监控的时候，不处理
	if (msz_menuFlag == 1) {
		return;
	}

	try {
		var warningCarPassInfoGrid = Ext.getCmp("warningCarPassInfoGrid");

		// 如果记录超过固定值，清零
		if (warningCarPassInfoGrid.getStore().getCount() >= m_iMaxlist) {
			warningCarPassInfoGrid.getStore().removeAll();

			if (m_selTabId == 0) {
				isSelected = false;
			}
		}

		// 如果违章信息存在，则添加到违章表格中
		if (m_szWarningCarData.length != 0) {
			warningCarPassInfoGrid.getStore()
					.loadData(m_szWarningCarData, true);
		}

		// 如果可以选定违章过车信息某行，滚动条不滚动
		if (m_selTabId == 0 && m_szWarningCarData.length != 0) {
			if (isSelected) {
				// 选定了某行，则滚动条不滚动
				if (selRowIndex > -1) {
					warningCarPassInfoGrid.getView().focusRow(selRowIndex);// 指定行
					warningCarPassInfoGrid.getSelectionModel()
							.selectRow(selRowIndex);
				}
				warningCarPassInfoGrid.getView().scroller.dom.scrollTop = selRowTop;
			} else {
				warningCarPassInfoGrid.getView().scroller.dom.scrollTop = (warningCarPassInfoGrid
						.getStore().getCount() - 5)
						* 40;
			}
		}

		m_szWarningCarData.length = 0;
	} catch (err) {
		cms.ext.alert('提示', err.description);
	}
	setTimeout("TryGetWarningPassCarInfo()", 1500);
}

/*******************************************************************************
 * Function: TryGetQuJianAlarmInfo Description: 定时去数组获取区间违章信息并显示 Output: 无
 * Return: 无
 ******************************************************************************/
function TryGetQuJianAlarmInfo() {
	// 如果点击实时视频监控的时候，不处理
	if (msz_menuFlag == 1) {
		return;
	}

	try {
		var quJianAlarmInfoGrid = Ext.getCmp("quJianAlarmInfoGrid");

		// 如果记录超过固定值，清零
		if (quJianAlarmInfoGrid.getStore().getCount() >= m_iMaxlist) {
			quJianAlarmInfoGrid.getStore().removeAll();

			if (m_selTabId == 2) {
				isSelected = false;
			}
		}

		// 如果违章信息存在，则添加到违章表格中
		if (quJianAlarmInfoGrid.length != 0) {
			quJianAlarmInfoGrid.getStore().loadData(m_szQuJianAlarmData, true);
		}

		// 如果可以选定违章过车信息某行，滚动条不滚动
		if (m_selTabId == 2 && m_szQuJianAlarmData.length != 0) {
			if (isSelected) {
				// 选定了某行，则滚动条不滚动
				if (selRowIndex > -1) {
					quJianAlarmInfoGrid.getView().focusRow(selRowIndex);// 指定行
					quJianAlarmInfoGrid.getSelectionModel()
							.selectRow(selRowIndex);
				}
				quJianAlarmInfoGrid.getView().scroller.dom.scrollTop = selRowTop;
			} else {
				quJianAlarmInfoGrid.getView().scroller.dom.scrollTop = (quJianAlarmInfoGrid
						.getStore().getCount() - 5)
						* 40;
			}
		}

		m_szQuJianAlarmData.length = 0;
	} catch (err) {
		cms.ext.alert('提示', err.description);
	}
	setTimeout("TryGetQuJianAlarmInfo()", 1500);
}

/*******************************************************************************
 * Function: ShowPreviewList Description: 显示预览详情 Input: 无 Output: 无 Return: 无
 ******************************************************************************/
function ShowPreviewList() {
	var m_szOCXControl = document.getElementById("SeeChanPicOCX");

	m_szOCXControl.ShowCarInfo();

	var buttonText = Ext.getCmp("btnCarDetail").getText();

	if (buttonText == "显示详情") {
		Ext.getCmp("btnCarDetail").setText("隐藏详情");
	} else {
		Ext.getCmp("btnCarDetail").setText("显示详情");
	}
}

/*******************************************************************************
 * Function: ShowRtimeWindows Description: 显示实时监测报警窗口 Input: RtimeAlarmType:
 * 报警类型 RtimeAlarmAdd ： 报警地点 RtimeAlarmContent ：描述信息 Output: 无 Return: 无
 ******************************************************************************/
function ShowRtimeWindows(RtimeAlarmType, RtimeAlarmAdd, RtimeAlarmContent) {
	try {
		var RtimeAlarmGrid = top.Ext.getCmp("optionInfoGrid");
		if (RtimeAlarmGrid == null) {
			var win = new cms.emap.optionInfoWindow();
			win.getControl().show();
		}

		RtimeAlarmGrid = top.Ext.getCmp("optionInfoGrid");

		// 如果该列表已经超过100条，则先清空
		if (RtimeAlarmGrid.getStore().getCount() >= 100) {
			RtimeAlarmGrid.getStore().removeAll();
		}

		// 插入记录
		RtimeAlarmGrid.getStore().insert(0, new Ext.data.Record({
							RtimeAlarmType : RtimeAlarmType,
							RtimeAlarmAdd : RtimeAlarmAdd,
							RtimeAlarmDescript : RtimeAlarmContent
						}));
	} catch (err) {
		cms.ext.alert('提示', err.description);
	}
}

/*******************************************************************************
 * Function: playMusic Description: 播放声音文件 Input: 无 Output: 无 Return: 无
 ******************************************************************************/
function playMusic() {
	// 如果点击实时视频监控的时候，不处理
	if (msz_menuFlag != 0) {
		return;
	}

	try {
		if (m_szAlarmMusicData.length == 0) {
			setTimeout("playMusic()", 1500);
			return;
		}
		var stUrl = m_szAlarmMusicData[0];

		if (m_szAlarmMusicData.length > 1) // 声音文件每次播放后只留最近的一个声音报警
		{
			m_szAlarmMusicData.splice(0, m_szAlarmMusicData.length - 1);
		} else {
			m_szAlarmMusicData.splice(0, 1);
		}

		document.getElementById("ActiveMovie1").URL = top.path + "/" + stUrl;
		document.getElementById("ActiveMovie1").controls.play();
	} catch (err) {
		// alert(err.description);
	}

	setTimeout("playMusic()", 1500);
}

/*******************************************************************************
 * Function: StopPlayMusic Description: 停止播放声音文件 Output: 无 Return: 无
 ******************************************************************************/
function StopPlayMusic() {
	try {
		document.getElementById("ActiveMovie1").controls.stop();
	} catch (err) {
		// alert(err)
	}
}

/*******************************************************************************
 * Function: showPreview Description: 视频预览 Input: szIP:设备IP地址 iPort:端口 szUser:用户
 * szPwd:密码 iChan:通道号 szCrossingName:路口名称 szLaneName:车道名称 Output: 无 Return: 无
 ******************************************************************************/
function showPreview(szIP, iPort, szUser, szPwd, iChan, szCrossingName,
		szLaneName) {
	try {
		if (szIP != "") {
			// if(m_szUserOptionRightShow.indexOf('@50015@') < 0)
			// {
			// alert(m_szNoRight);
			// return;
			// }
			// alert(szIP +":"+
			// iPort+":"+szUser+":"+szPwd+":"+iChan+":"+szCrossingName+":"+szLaneName);
			var m_szOCXControl = document.getElementById("SeeChanPicOCX");
			m_szOCXControl.StartRealplay(szIP, iPort, szUser, szPwd, iChan,
					szCrossingName, szLaneName);
		}
	} catch (err) {
		//
	}
}

/*******************************************************************************
 * Function: crossSetHandle Description: 视频预览 Input: Return: 无
 ******************************************************************************/
function crossSetHandle() {
	var type = 1;
	var treeType = 1;
	var winTitle = "订阅" + crossingManageName;
	var url = path + "/common/js/ext/CrossTree/selectCrossTree.jsp?type="
			+ type + "&crossLsh=" + selectedCrosslsh + "&treeType=" + treeType;
	OpenWindow("winCrossTree", winTitle, url, 400, 500, false);
}

/*******************************************************************************
 * Function: 打开路口订阅窗口 Description: 视频预览 Input: Return: 无
 ******************************************************************************/
function OpenWindow(id, title, url, w, h, iframe) {
	var winHeight = h;
	var scrollAble = 'no';

	// 如果可显区域的高度小于窗口高度，窗口显示滚动条
	if (top.document.body.clientHeight < h) {
		scrollAble = 'auto';
		winHeight = top.document.body.clientHeight - 20;
	}

	saveBtn = new top.Ext.Button({
				style : 'margin:0 3px;',
				text : '确定',
				id : 'saveBtn',
				width : 80,
				handler : saveBtnHandler
			});

	cancelBtn = new top.Ext.Button({
				style : 'margin:0 3px;',
				text : '取消',
				// id:'carEnsureBtn',
				width : 80,
				handler : cancelBtnHandler
			});

	var tb = new top.Ext.Toolbar({
				width : w,
				height : 40,
				border : 0,
				buttons : [saveBtn, cancelBtn]
			});

	crossSelectWin = new top.Ext.Window({
		id : id,
		title : title,
		width : w,
		height : winHeight,
		iframeMask : iframe,
		modal : true,
		border : false,
		bodyBorder : false,
		closable : true,
		closeAction : 'close',
		autoDestroy : true,
		resizable : false,
		plain : true,
		// bbar: tb,
		buttons : [saveBtn, cancelBtn],
		html : '<iframe id="newIframeWin" name='
				+ id
				+ '  src="'
				+ url
				+ '" scrolling="'
				+ scrollAble
				+ '" '
				+ ' style="position:absolute; visibility:inherit; top:0; left:0; width:100%; height:100%; z-index:100;"></iframe>',
		listeners : {}
	});
	
	//为窗口添加监听事件
	crossSelectWin.on("beforeclose",function(){
		var newIframeWin = top.document.getElementById('newIframeWin');
		newIframeWin.setAttribute('src', '');
		newIframeWin.parentNode.removeChild(newIframeWin);
		crossSelectWin.destroy();
		crossSelectWin = null;
	});

	crossSelectWin.show();
}

function saveBtnHandler() {
	var selectedCrosslshTemp = "";

	// 得到树
	var CrossTreePanel = top.newIframeWin.CrossTreePanel;
	var crossTree = top.newIframeWin.crossTree;
	var checkedNodeArray = CrossTreePanel.getChecked();

	if (checkedNodeArray.length == 0) {
		cms.ext.alert('提示', "请选择" + crossingManageName + "！");
		return;
	}

	for (i = checkedNodeArray.length - 1; i >= 0; i--) {
		if (checkedNodeArray[i].attributes.treeNodeType == 1
				&& checkedNodeArray[i].hidden == false) {
			selectedCrosslshTemp = checkedNodeArray[i].id.split("_")[1] + ","
					+ selectedCrosslshTemp;
		}
	}

	// 去掉逗号
	if (selectedCrosslshTemp != "") {
		selectedCrosslshTemp = selectedCrosslshTemp.substring(0,
				selectedCrosslshTemp.length - 1);
	}

	if (selectedCrosslshTemp == "") {
		cms.ext.alert('提示', "请选择" + crossingManageName + "！");
		return;
	}

	var isNone = top.newIframeWin.document.getElementById("CommonTree").style.display;
	if (isNone == "none") {
		cms.ext.alert('提示', "请选择" + crossingManageName + "！");
		return;
	}

	// 保存订阅路口信息
	var url = top.path
			+ "/carPicMonitorAction!saveSubscribeCross.action?crossLsh="
			+ selectedCrosslshTemp;

	// 保存订阅路口信息
	cms.util.ajaxSendRequestContinuous(url, saveSubscribeCross, null);

	function saveSubscribeCross(ajaxObj) {
		if (ajaxObj.readyState == 4) {
			var responseText = eval('(' + ajaxObj.responseText + ')');
			if (responseText.success == 1) {
				selectedCrosslsh = selectedCrosslshTemp;

				crossSelectWin.close();
				crossSelectWin = null;

				// 获取设置订阅连接报警服务器信息
				getsubscribeServer();

				// 连接报警服务器
				linkServer(1);
			} else {
				cms.ext.alert('提示', "保存失败！");
			}

		}
	}
}

function cancelBtnHandler() {
	crossSelectWin.close();
	crossSelectWin = null;
}

/*******************************************************************************
 * Function: linkToServerFinish Description: 连接服务器结束 Input: xml：连接成功信息 Return: 无
 ******************************************************************************/
function linkToServerFinish(xml) {
	// 计数器递增
	var szChildDataArray = [];

	xmlDoc.async = "false";
	xmlDoc.loadXML(xml);

	var length = xmlDoc.documentElement.childNodes.length;
	var serverType = "";

	// 取XML中各结点值{卡口编号,车辆编号,车牌号码,车牌类型,车辆类型,车速,限速,时间,地点,方向编号,图片路径,图片名称,车道号,车牌颜色,违法行为,车身颜色,过车流水号,路口名称,方向名称,报警流水号,车身长度}
	for (i = 1; i < length; i++) {
		var docChildNodes = []; // 解析xml数组存放
		var serverInfo = xmlDoc.documentElement.childNodes[i];
		try {
			isHasChild = serverInfo.childNodes[0].hasChildNodes();
			docChildNodes.push(serverInfo.childNodes[0].hasChildNodes()
					? serverInfo.childNodes[0].childNodes[0].nodeValue
					: '');
			docChildNodes.push(serverInfo.childNodes[1].hasChildNodes()
					? serverInfo.childNodes[1].childNodes[0].nodeValue
					: '');
			docChildNodes.push(serverInfo.childNodes[3].hasChildNodes()
					? serverInfo.childNodes[3].childNodes[0].nodeValue
					: '');
		} catch (err) {
			docChildNodes.push(0);
			cms.ext.alert('提示', err.description);
		}

		if (docChildNodes[2] == "0") {
			var serverType = "连接交通服务器失败";
			lint = 2;
			top.Ext.MessageBox.alert("连接状态", serverType, function(btn) {
						if (btn == "ok") {
							closein();
						}
					})
			// ShowRtimeWindows(serverType,"","名称: "+ docChildNodes[1]);
		} else {
			var serverType = "连接报警服务器成功";

			// ShowRtimeWindows(serverType,"","名称: "+ docChildNodes[1])
		}
	}
}
function closein() {
	Ext.getCmp('intime').close();
}
function getLastServerInfo(panel) {
	var serverLen = 0;
	var serverInfoArray = [];

	for (i = 0; i < lastServerInfoArray.length; i++) {
		if (lastServerInfoArray[i] == "") {
			continue;
		}

		var parentNode = panel.getNodeById(lastServerInfoArray[i].parentNodeId);
		var node = panel.getNodeById(lastServerInfoArray[i].nodeId);
		if (parentNode.attributes.treeNodeType == 1) {
			parentNode.getUI().getIconEl().src = "/skin/red/images/baynet/tree/kak.gif";
		} else {
			parentNode.getUI().getIconEl().src = "/skin/red/images/baynet/tree/LaneGroup.bmp";
		}

		if (node.attributes.dvrIp == "") {
			node.getUI().getIconEl().src = "/skin/red/images/baynet/tree/lan.gif";
		} else {
			node.getUI().getIconEl().src = "/skin/red/images/baynet/tree/camera.png";
		}

		// 如果还没有报警服务器
		if (serverInfoArray.length == 0) {
			serverInfoArray.push(lastServerInfoArray[i]);
		}
		// 如果已经有报警服务器
		else {
			var j = 0;
			for (j = 0; j < serverInfoArray.length; j++) {
				if (lastServerInfoArray[i] != ""
						&& lastServerInfoArray[i].serverIp == serverInfoArray[j].serverIp) {
					serverInfoArray[j].crosslsh = serverInfoArray[j].crosslsh
							+ "," + lastServerInfoArray[i].crosslsh;
					serverInfoArray[j].chanNum = serverInfoArray[j].chanNum
							+ "," + lastServerInfoArray[i].chanNum;
					serverInfoArray[j].playNum = serverInfoArray[j].playNum
							+ "," + lastServerInfoArray[i].playNum;
					break;
				}
			}

			if (j == serverInfoArray.length) {
				serverInfoArray.push(lastServerInfoArray[i]);
			}
		}

		playLaneCount--;
	}

	// 画面重新分隔
	for (i = 0; i < 25; i++) {
		windowNodeIdArray[i] = "";
		lastServerInfoArray[i] = "";
	}

	return serverInfoArray;
}

function playOrStopPic(flag, windowNum, serverArrayTemp) {
	var m_szOCXControl = document.getElementById("SeeChanPicOCX");
	var XmlDoc = new ActiveXObject("MSXML2.DOMDocument");
	var Instruction = XmlDoc.createProcessingInstruction("xml",
			"version='1.0' encoding='utf-8'");
	XmlDoc.appendChild(Instruction);
	var Root = XmlDoc.createNode(1, "RequestInfo", "");
	var Element = XmlDoc.createElement("RequestType"); // //请求报警服务器
	Element.text = flag;
	Root.appendChild(Element);
	var groupLaneCount = 0;
	Element = XmlDoc.createElement("GroupLaneCount"); // //请求报警服务器

	for (i = 0; i < serverArrayTemp.length; i++) {
		var crossLshArray = serverArrayTemp[i].crosslsh.split(",");
		groupLaneCount = groupLaneCount + crossLshArray.length;
	}

	Element.text = groupLaneCount;

	Root.appendChild(Element);

	for (i = 0; i < serverArrayTemp.length; i++) {
		var groupInfoRoot = XmlDoc.createNode(1, "GroupInfo", "");
		Element = XmlDoc.createElement("AlarmServerIp"); // //请求报警服务器
		Element.text = serverArrayTemp[i].serverIp;
		groupInfoRoot.appendChild(Element);

		Element = XmlDoc.createElement("ServerPort");
		Element.text = serverArrayTemp[i].serverPort;
		groupInfoRoot.appendChild(Element);

		Element = XmlDoc.createElement("ServerName");
		Element.text = serverArrayTemp[i].serverName;
		groupInfoRoot.appendChild(Element);

		// var szCrossingInfo = XmlDoc.createNode(1,"CrossingInfo","");

		crossLshArray = serverArrayTemp[i].crosslsh.split(",");
		crossNum = crossLshArray.length;
		groupLaneCount = groupLaneCount + crossNum;

		chanLshArray = serverArrayTemp[i].chanNum.split(",");

		playNumArray = serverArrayTemp[i].playNum.split(",");

		Element = XmlDoc.createElement("AlarmLaneCount");
		Element.text = crossNum;
		groupInfoRoot.appendChild(Element);

		for (j = 0; j < crossNum; j++) {
			Element = XmlDoc.createElement("CrossLsh");
			Element.text = crossLshArray[j];
			groupInfoRoot.appendChild(Element);

			Element = XmlDoc.createElement("ChanLsh");
			Element.text = chanLshArray[j];
			groupInfoRoot.appendChild(Element);

			Element = XmlDoc.createElement("PlayNum");
			Element.text = playNumArray[j];
			groupInfoRoot.appendChild(Element);
		}

		Root.appendChild(groupInfoRoot);
	}

	XmlDoc.appendChild(Root);
	// alert("stop="+windowNum+"_"+XmlDoc.xml);
	m_szOCXControl.GetGroupCrossingEx(windowNum, XmlDoc.xml);
}

function findElementValueByName1(xmlDoc, name) {
	var value = "";
	try {
		//alert(xmlDoc);
		//alert(name+":"+ xmlDoc.documentElement.childNodes.length);
		//alert(xmlDoc.documentElement.childNodes[0].childNodes[0].nodeValue);
		value = xmlDoc.getElementsByTagName(name)[0].firstChild.nodeValue;
		//alert(value);
	} catch (e) {
		//alert(e.description);
		//cms.ext.alert("",e.description);
	}
	return value;
}

/** 加载xml文件 */
function loadXML(xmlInfo) {
	//var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
	xmlDoc.async = false;
	xmlDoc.loadXML(xmlInfo); // loadXML方法载入xml字符串
	return xmlDoc;
	
	// 判断浏览器的类型
	// 支持IE浏览器
	if (!window.DOMParser && window.ActiveXObject) { // window.DOMParser
		// 判断是否是非ie浏览器
		var xmlDomVersions = ['MSXML.2.DOMDocument.6.0',
				'MSXML.2.DOMDocument.3.0', 'Microsoft.XMLDOM'];
		for (var i = 0; i < xmlDomVersions.length; i++) {
			try {
				xmlDoc = new ActiveXObject(xmlDomVersions[i]);
				xmlDoc.async = false;
				xmlDoc.loadXML(xmlInfo); // loadXML方法载入xml字符串
				break;
			} catch (e) {
			}
		}
	}
	// 支持Mozilla浏览器
	else if (window.DOMParser && document.implementation
			&& document.implementation.createDocument) {
		try {
			domParser = new DOMParser();
			xmlDoc = domParser.parseFromString(xmlInfo, 'text/xml');
		} catch (e) {
		}
	} else {
		return null;
	}
	return xmlDoc;
}


/**
 * @function findElementValueFromXml
 * @description 根据名称获取xml字段值
 * @param xmlDoc：xml
 * @param name：xml属性名称
 * @return xml属性值
 */
function findElementValueFromXml(xmlInfo,name)
{
	xmlDoc = loadXML(xmlInfo);

	return findElementValueByName1(xmlDoc,name);
}

function analysisXml(xmlInfo)
{	
	var xylx = findElementValueFromXml(xmlInfo,"XYLX");//协议类型

	//如果不是接受协议
	if(xylx != "1")
	{
		return;
	}
	
	// 正常数据、违章数据、布控数据三种xml共通部分
	var sjlx = findElementValueFromXml(xmlInfo,"SJLX");//数据类型:1:正常数据、2:违章数据、3:布控数据
	var lshm = findElementValueFromXml(xmlInfo,"LSHM");//普通过车流水号  
	var jgsj = findElementValueFromXml(xmlInfo,"JGSJ");//经过时间（格式为：2012-06-13 12:59:59.235）
	var lkbh = findElementValueFromXml(xmlInfo,"LKBH");//路口流水号
	var lkmc = findElementValueFromXml(xmlInfo,"LKMC");//路口名称
	var fxmc = findElementValueFromXml(xmlInfo,"FXMC");//方向名称
	var cdbh = findElementValueFromXml(xmlInfo,"CDBH");//车道编号
	var cdmc = findElementValueFromXml(xmlInfo,"CDMC");//车道名称
	var hphm = findElementValueFromXml(xmlInfo,"HPHM");//号牌号码
	var clsd = findElementValueFromXml(xmlInfo,"CLSD");//车辆速度
	var szsd = findElementValueFromXml(xmlInfo,"SZSD");//限制速度
	var clcd = findElementValueFromXml(xmlInfo,"CLCD");//车辆长度
	if(clcd != "")
	{
		clcd = parseFloat(parseInt(clcd)/10);// 车辆长度由分米转换为米
	}
	var clys = findElementValueFromXml(xmlInfo,"CLYS");//车辆颜色名称
	var cllx = findElementValueFromXml(xmlInfo,"CLLX");//车辆类型名称
	var hpys = findElementValueFromXml(xmlInfo,"HPYS");//号牌颜色名称
	var hplx = findElementValueFromXml(xmlInfo,"HPLX");//号牌类型名称
	var clyc = findElementValueFromXml(xmlInfo,"CLYC");//车辆vrb的远程全路径
	var hpyc = findElementValueFromXml(xmlInfo,"HPYC");//号牌vrb的远程全路径
	var bjya = ""; // 报警预案
	var wflx = ""; // 违法类型
	var bkbh = "0";// 布控流水号
	var bkyy = ""; // 布控原因
	var wfdm = 0;
	
	//违章数据
	if(sjlx == "1")
	{
		wflx = "正常";//违法类型名称(行车状态)
	}
	//违章数据
	else if(sjlx == "2")
	{
		wflx = findElementValueFromXml(xmlInfo,"WFLX");//违法类型名称
		wfdm = findElementValueFromXml(xmlInfo,"WFDM");//违法类型代码
	}
	//布控数据
	else if(sjlx == "3")
	{
		bkbh = findElementValueFromXml(xmlInfo,"BKBH");//布控流水号
		wflx = findElementValueFromXml(xmlInfo,"BKLX");//布控类型名称，显示在违法类型列
		bkyy = findElementValueFromXml(xmlInfo,"BKYY");//布控原因
		bjya = findElementValueFromXml(xmlInfo,"BJYA");//报警预案名称
	}
	
	var szChildDataArray = [];
	szChildDataArray[0] = hpyc; // 车牌图片
	szChildDataArray[1] = jgsj; // 过车时间
	szChildDataArray[2] = lkmc; // 路口名称
	szChildDataArray[3] = hphm; // 车牌号码
	szChildDataArray[4] = clsd; // 车速
	szChildDataArray[5] = szsd; // 限速
	szChildDataArray[6] = wflx; // 违法行为
	szChildDataArray[7] = cdbh; // 车道号
	szChildDataArray[8] = cdmc; // 车道名称
	szChildDataArray[9] = clys; // 车辆颜色
	szChildDataArray[10] = hpys; // 车牌颜色
	szChildDataArray[11] = cllx;// 车辆类型
	szChildDataArray[12] = hplx;// 车牌类型
	szChildDataArray[13] = fxmc;// 方向名称
	szChildDataArray[14] = lshm;// 车辆流水号
	szChildDataArray[15] = bjya;// 报警预案
	szChildDataArray[16] = clcd;// 车身长度
	szChildDataArray[17] = clyc;// 车辆图片
	szChildDataArray[18] = lkbh;// 路口流水号
	szChildDataArray[19] = bkbh;// 布控流水号
	szChildDataArray[20] = wfdm;// 违法行为代码
	szChildDataArray[21] = "正常";   // 校对结果
	szChildDataArray[22] = bkyy;// 布控原因
	
	// 正常过车
	if(sjlx == "1")
	{
		m_szPassCarData.push(szChildDataArray);
	}
	// 违章过车：包含布控车辆。
	else 
	{
		//getAlarmMusic(wfdm,bkbh,bkyy);//获取报警声音
		
		// 违章过车红色标记,图片路径不加
		for(i = 1; i < szChildDataArray.length; i++)
		{
			szChildDataArray[i] = '<font color=#FF0000>' + szChildDataArray[i] + '</font>';
		}
		
		m_szPassCarData.push(szChildDataArray);
	}
}