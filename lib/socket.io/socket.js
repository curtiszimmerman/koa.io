/*!
 * koa.io - lib/socket.io/socket.js
 * Copyright(c) 2014 dead_horse <dead_horse@qq.com>
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var debug = require('debug')('koa.io:socket.io:socket');
var OriginalSocket = require('socket.io/lib/socket');
var delegate = require('delegates');
var Cookies = require('cookies');
var parse = require('parseurl');
var qs = require('querystring');

/**
 * Module exports.
 */

module.exports = Socket;

/**
 * Socket context
 *
 * @param {[type]} nsp [description]
 * @param {[type]} client [description]
 */

function Socket(nsp, client) {
  if (!(this instanceof Socket)) return new Socket(nsp, client);
  this.socket = new OriginalSocket(nsp, client);
  this.cookies = new Cookies(this.socket.request, res, nsp.server.keys);
}

/**
 * alias Socket.prototype
 */

var socket = Socket.prototype;

delegate(socket, 'socket')
  .getter('client')
  .getter('server')
  .getter('adapter')
  .getter('id')
  .getter('request')
  .getter('conn')
  .getter('rooms')
  .getter('acks')
  .getter('json')
  .getter('volatile')
  .getter('broadcast')
  .getter('connected')
  .getter('disconnected')
  .getter('handshake')
  .method('join')
  .method('leave')
  .method('emit')
  .method('to')
  .method('in')
  .method('send')
  .method('write')
  .method('disconnect');


/**
 * Return request header
 *
 * @return {Object}
 * @api public
 */

Socket.prototype.__defineGetter__('header', function () {
  return this.request.headers;
});

/**
 * Return request header, alias as request.header
 *
 * @return {Object}
 * @api public
 */

Socket.prototype.__defineGetter__('headers', function () {
  return this.request.headers;
});

/**
 * Get request URL.
 *
 * @return {String}
 * @api public
 */

Socket.prototype.__defineGetter__('url', function () {
  return this.request.url;
});

/**
 * Get request pathname.
 *
 * @return {String}
 * @api public
 */

Socket.prototype.__defineGetter__('path', function () {
  return parse(this.request).pathname;
});

/**
 * Get parsed query-string.
 *
 * @return {Object}
 * @api public
 */

Socket.prototype.__defineGetter__('query', function () {
  var str = this.querystring;
  if (!str) return {};

  var c = this._querycache = this._querycache || {};
  return c[str] || (c[str] = qs.parse(str));
});


/**
 * Get query string.
 *
 * @return {String}
 * @api public
 */

Socket.prototype.__defineGetter__('querystring', function () {
  return parse(this.request).query || '';
});

/**
 * Get the search string. Same as the querystring
 * except it includes the leading ?.
 *
 * @return {String}
 * @api public
 */

Socket.prototype.__defineGetter__('search', function () {
  if (!this.querystring) return '';
  return '?' + this.querystring;
});

/**
 * Parse the "Host" header field host
 * and support X-Forwarded-Host when a
 * proxy is enabled.
 *
 * @return {String} hostname:port
 * @api public
 */

Socket.prototype.__defineGetter__('host', function () {
  var proxy = this.server.proxy;
  var host = proxy && this.get('X-Forwarded-Host');
  host = host || this.get('Host');
  if (!host) return;
  return host.split(/\s*,\s*/)[0];
});

/**
 * Parse the "Host" header field hostname
 * and support X-Forwarded-Host when a
 * proxy is enabled.
 *
 * @return {String} hostname
 * @api public
 */

Socket.prototype.__defineGetter__('hostname', function () {
  var host = this.host;
  if (!host) return;
  return host.split(':')[0];
});

/**
 * Get the charset when present or undefined.
 *
 * @return {String}
 * @api public
 */

Socket.prototype.__defineGetter__('charset', function () {
  var type = this.get('Content-Type');
  if (!type) return;

  return typer.parse(type).parameters.charset;
});

/**
 * Return parsed Content-Length when present.
 *
 * @return {Number}
 * @api public
 */

Socket.prototype.__defineGetter__('length', function () {
  var len = this.get('Content-Length');
  if (null == len) return;
  return ~~len;
});

/**
 * Return the protocol string "http" or "https"
 * when requested with TLS. When the proxy setting
 * is enabled the "X-Forwarded-Proto" header
 * field will be trusted. If you're running behind
 * a reverse proxy that supplies https for you this
 * may be enabled.
 *
 * @return {String}
 * @api public
 */

Socket.prototype.__defineGetter__('protocol', function () {
  var proxy = this.server.proxy;
  if (this.request.connection.encrypted) return 'https';
  if (!proxy) return 'http';
  var proto = this.get('X-Forwarded-Proto') || 'http';
  return proto.split(/\s*,\s*/)[0];
});

/**
 * Short-hand for:
 *
 *    this.protocol == 'https'
 *
 * @return {Boolean}
 * @api public
 */

Socket.prototype.__defineGetter__('secure', function () {
  return 'https' == this.protocol;
});

/**
 * Return the remote address, or when
 * `server.proxy` is `true` return
 * the upstream addr.
 *
 * @return {String}
 * @api public
 */

Socket.prototype.__defineGetter__('ip', function () {
  return this.ips[0] || this.conn.remoteAddress;
});

/**
 * When `server.proxy` is `true`, parse
 * the "X-Forwarded-For" ip address list.
 *
 * For example if the value were "client, proxy1, proxy2"
 * you would receive the array `["client", "proxy1", "proxy2"]`
 * where "proxy2" is the furthest down-stream.
 *
 * @return {Array}
 * @api public
 */

Socket.prototype.__defineGetter__('ips', function () {
  var proxy = this.server.proxy;
  var val = this.get('X-Forwarded-For');
  return proxy && val
    ? val.split(/ *, */)
    : [];
});

/**
 * Return request header.
 *
 * The `Referrer` header field is special-cased,
 * both `Referrer` and `Referer` are interchangeable.
 *
 * Examples:
 *
 *     this.get('Content-Type');
 *     // => "text/plain"
 *
 *     this.get('content-type');
 *     // => "text/plain"
 *
 *     this.get('Something');
 *     // => undefined
 *
 * @param {String} field
 * @return {String}
 * @api public
 */

Socket.prototype.get = function (field) {
  var req = this.request;
  switch (field = field.toLowerCase()) {
    case 'referer':
    case 'referrer':
      return req.headers.referrer || req.headers.referer;
    default:
      return req.headers[field];
  }
};


// for compact
Socket.prototype.set = function () {
  debug('socket.io can not set header');
};

/**
 * mock res for cookies
 * @type {Object}
 */

var res = {
  setHeader: function () {},
  getHeader: function() {}
};
