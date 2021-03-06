class NewColumn extends Dialog {

  constructor (handler, params) {
    params = Object.assign({title: "Create column"}, params || {});
    super(handler, params);

    this.groups = {
      "Number":     ['bigint', 'integer', 'real', 'smallint', 'double precision', 'numeric', 'decimal',
                     'int2vector', 'int4range', 'int8range', 'numrange', ''],
      "Text":       ['text', 'character varying', 'character', 'name', 'bit', 'bit varying'],
      "ID column":  ['uuid', 'smallserial', 'serial', 'bigserial', 'oid'],
      "Date":       ['date', 'timestamp without time zone', 'timestamp with time zone',
                     'time without time zone', 'time with time zone'],
      "Time Range": ['interval', 'tsrange', 'tstzrange', 'daterange', 'tinterval', 'reltime', 'abstime'],
      "Boolean":    ['boolean'],
      "JSON":       ['json', 'jsonb'],
      "Network":    ['macaddr', 'macaddr8', 'cidr', 'inet'],
      "Geometry":   ['point', 'line', 'lseg', 'box', 'path', 'polygon', 'circle'],
      "Text Search": ['tsvector', 'tsquery', '']
    };

    this.showWindow();
  }

  showWindow () {
    Model.Column.availableTypes((types) => {
      this.addPseudoTypes(types);
      var groupedTypes = this.groupTypes(types);
      var nodes = App.renderView('dialogs/column_form', {groupedTypes: groupedTypes, action: "create"});
      this.content = this.renderWindow(this.title, nodes);
      this.bindFormSubmitting();
    });
  }

  onSubmit (data) {
    if (data.type == "") {
      window.alert("Please choose column type");
      return;
    }
    if (data.allow_null == "1") {
      data.is_null = true;
    }
    this.handler.addColumn(data, this.defaultServerResponse.bind(this));
  }

  addPseudoTypes (types) {
    types.push({name: "smallserial", description: "small autoincrementing integer"});
    types.push({name: "serial", description: "autoincrementing integer"});
    types.push({name: "bigserial", description: "large autoincrementing integer"});
  }

  groupTypes (types) {
    var types = types.slice(0);
    var grouped = {};
    var groupName;

    for (groupName in this.groups) {
      grouped[groupName] = [];
      this.groups[groupName].forEach((type) => {
        var typeRow;
        types.forEach((t, i) => {
          if (t.name == type) {
            typeRow = t;
            delete types[i];
          }
        });
        if (typeRow) grouped[groupName].push(typeRow);
      });
    }

    types.forEach((type, i) => {
      if (type.schema != 'pg_catalog') {
        if (!grouped['Extensions']) {
          grouped['Extensions'] = [];
        }
        grouped['Extensions'].push(type);
        delete types[i];
      }
    });

    grouped['Other'] = types;
    return grouped;
  }
}

global.Dialog.NewColumn = NewColumn;
module.exports = NewColumn;
