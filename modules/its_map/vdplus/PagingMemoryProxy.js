Ext.namespace("Ext.ux");
Ext.namespace("Ext.ux.data");
/**
 * @author : zhangsl
 * @date : 2011-11-22 上午8:45:46
 * @description:前台分页
 */
if (!Array.prototype.map) {
	Array.prototype.map = function(fun) {
		var len = this.length;
		if (typeof fun != "function") {
			throw new TypeError();
		}
		var res = new Array(len);
		var thisp = arguments[1];
		for (var i = 0; i < len; i++) {
			if (i in this) {
				res[i] = fun.call(thisp, this[i], i, this);
			}
		}
		return res;
	};
}
// 前台分页
Ext.ux.data.PagingMemoryProxy = function(data, config) {
	Ext.ux.data.PagingMemoryProxy.superclass.constructor.call(this);
	this.data = data;
	Ext.apply(this, config);
};
Ext.extend(Ext.ux.data.PagingMemoryProxy, Ext.data.MemoryProxy, {
	customFilter : null,

	doRequest : function(action, rs, params, reader, callback, scope, arg) {
		params = params || {};
		var result;
		try {
			result = reader.readRecords(this.data);
		} catch (e) {
			this.fireEvent("loadexception", this, null, arg, e);
			this.fireEvent('exception', this, 'response', action, arg, null, e);
			callback.call(scope, null, arg, false);
			return;
		}
		// 过滤
		if (this.customFilter != null) {
			result.records = result.records.filter(this.customFilter);
			result.totalRecords = result.records.length;
		} else if (params.filter !== undefined) {
			result.records = result.records.filter(function(el) {
						if (typeof(el) == "object") {
							var att = params.filterCol || 0;
							return String(el.data[att]).match(params.filter)
									? true
									: false;
						} else {
							return String(el).match(params.filter)
									? true
									: false;
						}
					});
			result.totalRecords = result.records.length;
		}
		// 排序
		if (params.sort !== undefined) {
			var dir = String(params.dir).toUpperCase() == "DESC" ? -1 : 1;
			var fn = function(r1, r2) {
				return r1 == r2 ? 0 : r1
			};
			var st = reader.recordType.getField(params.sort).sortType;
			result.records.sort(function(a, b) {
						var v = 0;
						if (typeof(a) == "object") {
							v = fn(st(a.data[params.sort]),
									st(b.data[params.sort]))
									* dir;
						} else {
							v = fn(a, b) * dir;
						}
						if (v == 0) {
							v = (a.index < b.index ? -1 : 1);
						}
						return v;
					});
		}
		if (params.start !== undefined && params.limit !== undefined) {
			result.records = result.records.slice(params.start, params.start
							+ params.limit);
		}
		callback.call(scope, result, arg, true);
	}
});