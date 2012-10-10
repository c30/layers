Ext.ux.AutoComplete = Ext.extend(Ext.form.ComboBox, {
	typeAhead : false,
	loadingText : '载入中...',
	hideTrigger : true,
	minChars : 1,
	width : 220,
	autoHeight : true,
	queryParam : 'elementName',
	emptyText : '输入要查询的资源名称',
	multi : false,
	store : {
		xtype : 'jsonstore',
		url : '/ezEmapInfoAction!autoQueryElement.action',
		autoDestroy : true,
		root : 'emapElements',
		fields : ['elementId', 'elementName', 'elementType']
	},
	tpl : new Ext.XTemplate(
			'<tpl for="."><div class="auto-item">',
			'<font size="2">名称：{elementName}</font><p><font size="2">类型：<tpl if="elementType==6000">'
					+ top.crossingManageName
					+ '</tpl><tpl if="elementType!=6000">监控点</tpl></font>',
			'</div></tpl>'),
	itemSelector : 'div.auto-item',
	// initComponent : function() {
	// if (this.simple) {
	// this.tpl = new Ext.XTemplate(
	// '<div class="auto-item">',
	// '<h3>{elementId}<a
	// class="auto-fld1">{elementName}</a>({elementType})</h3>',
	// '</div>');
	// }
	// Ext.ux.AutoComplete.superclass.initComponent.call(this);
	// },
	onSelect : function(record, index) {
		var value = this.getElValue();
		var eventObject = {
			eventCode : 'panTo2',
			params : {
				elemid : record.data['elementId']
			},
			sender : this
		};
		this.fireEvent(eventObject.eventCode, eventObject);
		if (this.multi) {
			value += record.data['elementName'];
		} else {
			value = record.data['elementName'];
		}
		if (this.fireEvent('beforeselect', this, record, index) !== false) {
			this.setValue(value);
			this.collapse();
			this.fireEvent('select', this, record, index);
		}
	},
	getElValue : function() {
		var v = this.el.dom.value;
		if (typeof(v) == 'string' && v.length > 0) {
			var result = /\w+\@[^;,\s]+/ig.exec(v);
			if (result)
				return result.join(';') + ';';
		}
		return '';
	}
});
Ext.reg('zhangsl', Ext.ux.AutoComplete);