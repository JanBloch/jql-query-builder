class Query {
  constructor(host) {
    this.text = `https://${host}/rest/api/2/search`;
    this.headers = {};
    this.expression = new Expression();
    this.orderBy = [];
  }

  andEquals(field, value) {
    return this.and(equals(field, value));
  }
  andNotEquals(field, value) {
    return this.and(notEquals(field, value));
  }
  auth(type, key) {
    this.headers["Authorization"] = `${type} ${key}`;
    return this;
  }
  andInList(field, list) {
    return this.and(inList(field, list));
  }
  and(expression) {
    if (this.expression.count == 1 && this.expression.firstCount > 1)
      this.expression.text = `(${this.expression.text})`;
    this.expression.and(expression);
    return this;
  }
  or(expression) {
    if (this.expression.count == 1 && this.expression.firstCount > 1)
      this.expression.text = `(${this.expression.text})`;
    this.expression.or(expression);
    return this;
  }
  orderBy(...fields) {
    this.fields.push(...fields);
  }
  async execute(object) {
    return new Promise((resolve, reject) => {
      if (object.get) {
        object
          .get(this.toString(), { headers: this.headers })
          .then(resolve)
          .catch(reject);
      }
    });
  }
  toString() {
    if (this.expression.count) {
      if (this.orderBy.length) {
        return `${this.text}?jql=${
          this.expression
        } ORDER BY ${this.orderBy.join(", ")}`;
      }
      return `${this.text}?jql=${this.expression}`;
    }
    return `${this.text}`;
  }
}

class Expression {
  constructor(text = "") {
    this.count = text.length > 0;
    this.firstCount = 0;
    this.text = text;
  }
  and(expression) {
    if (this.count > 0) {
      this.text += " AND ";
    } else {
      this.firstCount = expression.count;
    }
    if (expression.count > 1 && this.count > 0) {
      this.text += `(${expression})`;
    } else {
      this.text += expression;
    }
    this.count++;
    return this;
  }
  or(expression) {
    if (this.count > 0) {
      this.text += " OR ";
    }
    if (expression.count > 1 && this.count > 0) {
      this.text += `(${expression})`;
    } else {
      this.text += expression;
    }
    this.count++;
    return this;
  }
  toString() {
    return this.text;
  }
}
function equals(field, value) {
  return new Expression(`${field}=${value}`);
}
function notEquals(field, value) {
  return new Expression(`${field}!=${value}`);
}
function contains(field, value) {
  return new Expression(`${field}~${value}`);
}
function notContains(field, value) {
  return new Expression(`${field}!~${value}`);
}
function empty(field) {
  return new Expression(`${field} IS EMPTY`);
}
function notEmpty(field) {
  return new Expression(`${field} IS NOT EMPTY`);
}
function isNull(field) {
  return new Expression(`${field} IS NULL`);
}
function isNotNull(field) {
  return new Expression(`${field} IS NOT NULL`);
}
function inList(field, list) {
  return new Expression(`${field} in (${list.join()})`);
}
function notInList(field, list) {
  return new Expression(`${field} NOT in (${list.join()})`);
}
function greaterThan(field, value) {
  return new Expression(`${field} > ${value}`);
}
function greaterThanEquals(field, value) {
  return new Expression(`${field} >= ${value}`);
}
function lessThan(field, value) {
  return new Expression(`${field} < ${value}`);
}
function lessThanEquals(field, value) {
  return new Expression(`${field} <= ${value}`);
}

module.exports = {
  Query: Query,
  equals: equals,
  notEquals: notEquals,
  empty: empty,
  inList: inList,
  contains: contains,
  notContains: notContains,
  notInList: notInList,
  greaterThan: greaterThan,
  greaterThanEquals: greaterThanEquals,
  lessThan: lessThan,
  lessThanEquals: lessThanEquals,
  notEmpty: notEmpty,
  isNull: isNull,
  isNotNull: isNotNull,
};
