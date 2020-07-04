//var MongoClient = require('mongodb').MongoClient;
//var url = "mongodb://localhost:27017/runoob";
// 
//MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
//  if (err) throw err;
//  console.log("数据库已创建!");
//  db.close();
//});
//-----------------
/**
 * 
 创建集合
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/runoob';
MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
    if (err) throw err;
    console.log('数据库已创建');
    var dbase = db.db("runoob");
    dbase.createCollection('site', function (err, res) {
        if (err) throw err;
        console.log("创建集合!");
        db.close();
    });
});
 * 


var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
 
MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
    if (err) throw err;
    var dbo = db.db("runoob");
    var myobj = { name: "菜鸟教程", url: "www.runoob" };
    dbo.collection("site").insertOne(myobj, function(err, res) {
        if (err) throw err;
        console.log("文档插入成功");
        db.close();
    });
});

插入多条数据
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
 
MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
    if (err) throw err;
    var dbo = db.db("runoob");
    var myobj =  [
        { name: '菜鸟工具', url: 'https://c.runoob.com', type: 'cn'},
        { name: 'Google', url: 'https://www.google.com', type: 'en'},
        { name: 'Facebook', url: 'https://www.google.com', type: 'en'}
       ];
    dbo.collection("site").insertMany(myobj, function(err, res) {
        if (err) throw err;
        console.log("插入的文档数量为: " + res.insertedCount);
        db.close();
    });
});



-------------
查询数据
可以使用 find() 来查找数据, find() 可以返回匹配条件的所有数据。 如果未指定条件，find() 返回集合中的所有数据。

find()
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
 
MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
    if (err) throw err;
    var dbo = db.db("runoob");
    dbo.collection("site"). find({}).toArray(function(err, result) { // 返回集合中所有数据
        if (err) throw err;
        console.log(result);
        db.close();
    });
});
以下实例检索 name 为 "菜鸟教程" 的实例：

查询指定条件的数据
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
 
MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
    if (err) throw err;
    var dbo = db.db("runoob");
     var whereStr = {"name":'菜鸟教程'};  // 查询条件
    dbo.collection("site").find(whereStr).toArray(function(err, result) {
        if (err) throw err;
        console.log(result);
        db.close();
    });
});


----------------------------------
更新数据
我们也可以对数据库的数据进行修改，以下实例将 name 为 "菜鸟教程" 的 url 改为 https://www.runoob.com：

更新一条数据
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
 
MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
    if (err) throw err;
    var dbo = db.db("runoob");
    var whereStr = {"name":'菜鸟教程'};  // 查询条件
    var updateStr = {$set: { "url" : "https://www.runoob.com" }};
    dbo.collection("site").updateOne(whereStr, updateStr, function(err, res) {
        if (err) throw err;
        console.log("文档更新成功");
        db.close();
    });
});
执行成功后，进入 mongo 管理工具查看数据已修改：

> db.site.find().pretty()
{
    "_id" : ObjectId("5a794e36763eb821b24db854"),
    "name" : "菜鸟教程",
    "url" : "https://www.runoob.com"     // 已修改为 https
}
如果要更新所有符合条的文档数据可以使用 updateMany()：

更新多条数据
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
 
MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
    if (err) throw err;
    var dbo = db.db("runoob");
    var whereStr = {"type":'en'};  // 查询条件
    var updateStr = {$set: { "url" : "https://www.runoob.com" }};
    dbo.collection("site").updateMany(whereStr, updateStr, function(err, res) {
        if (err) throw err;
         console.log(res.result.nModified + " 条文档被更新");
        db.close();
    });
});
result.nModified 为更新的条数。

删除数据
以下实例将 name 为 "菜鸟教程" 的数据删除 :

删除一条数据
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
 
MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
    if (err) throw err;
    var dbo = db.db("runoob");
    var whereStr = {"name":'菜鸟教程'};  // 查询条件
    dbo.collection("site").deleteOne(whereStr, function(err, obj) {
        if (err) throw err;
        console.log("文档删除成功");
        db.close();
    });
});
执行成功后，进入 mongo 管理工具查看数据已删除：

> db.site.find()
> 
如果要删除多条语句可以使用 deleteMany() 方法

以下实例将 type 为 en 的所有数据删除 :

删除多条数据
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
 
MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
    if (err) throw err;
    var dbo = db.db("runoob");
    var whereStr = { type: "en" };  // 查询条件
    dbo.collection("site").deleteMany(whereStr, function(err, obj) {
        if (err) throw err;
        console.log(obj.result.n + " 条文档被删除");
        db.close();
    });
});
obj.result.n 删除的条数。

排序
排序 使用 sort() 方法，该方法接受一个参数，规定是升序(1)还是降序(-1)。

例如：

{ type: 1 }  // 按 type 字段升序
{ type: -1 } // 按 type 字段降序
按 type 升序排列:

排序
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
 
MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
    if (err) throw err;
    var dbo = db.db("runoob");
    var mysort = { type: 1 };
    dbo.collection("site").find().sort(mysort).toArray(function(err, result) {
        if (err) throw err;
        console.log(result);
        db.close();
    });
});





 */

import * as MONGO from "mongodb";
import * as BLUE from '../utils';
export enum DB_OP {
    insert=1,
    update,
}

export class DB_CONN{
    private _dbClients:any = [];
    private _url!:string;
    private _opts!:MONGO.MongoClientOptions;
    private _data!:any;
    constructor( url:string
        ,opts:MONGO.MongoClientOptions
        ,data:any){
        this._url ="mongodb://" +  url;
        this._opts = opts;
        this._data = data;
    }
    public free(db:MONGO.MongoClient) {
        this._dbClients.push(db);
    }
    public conndo(handle:(err:MONGO.MongoError,db:MONGO.MongoClient)=>void) {
        let self = this;
        let clt:MONGO.MongoClient;
        if (self._dbClients.length > 0 ){
            clt = self._dbClients.pop();
        }else{
            clt = new MONGO.MongoClient(self._url,self._opts);
        }
        clt.connect(function (e:any, db:any) {
            if (e){
                handle(e,db);
                return;
            }
            handle(e, db);
         } );
    }
}

export class DB_handle{
    private _conn!:DB_CONN;
    constructor( conn:DB_CONN){
        this._conn = conn;
    }
    public createDB(dbname:string, handle:any) {
        let self = this;
        self._conn.conndo( (err:any, db:any)=> { 
            if (err) 
            {
                BLUE.notice("db["+dbname+"] createDB err["+err.message+"]!"); 
                handle(err,null);
                return;
            }
            let dbase = db.db(dbname);
            let colname = "dbcreate";
            dbase.createCollection(colname, function (e:any, res:any) {
                if (e) {
                    self._conn.free(db);
                    BLUE.notice("db["+dbname+"] collect["+colname+"] createIndex err["+e.message+"]!"); 
                    handle(e,null); 
                    return;
                }
                self._conn.free(db);
                BLUE.notice("db["+dbname+"] collect["+colname+"] created!"); 
                handle(err,null); 
            });
        });
    }
    public createIndex( handle:(err:any,res:any)=>void, 
        dbname: string, colname: string, indexobj: any, unique: boolean = false) {
        let self = this;
        self._conn.conndo(function (err, db) {
            if (err) {
                self._conn.free(db);
                BLUE.notice("db["+dbname+"] collect["+colname+"] createIndex err["+err.message+"]!"); 
                handle(err, null);
                return;
            }
            let dbop: any = db.db(dbname);
            let col:any = dbop.collection(colname);
            col.createIndex( 
                indexobj
                ,{unique:unique}
                ,handle );
        });
    }

    public insert(dbname:string, colname:string,
        itms:any,handle:(err:any,res:any)=>void ){
        let self = this;
        self._conn.conndo(function (err, db) {
            if (err){
                self._conn.free(db);
                BLUE.notice("db["+dbname+"] collect["+colname+"] insert err["+err.message+"]!"); 
                handle(err,itms);
                return;
            }
            let dbop:any= db.db(dbname);
            let col = dbop.collection(colname);
            //col.insertOne(itms, function (err: any, res: any) {
            col.insertMany(itms, function (e: any, res: any) {
                if (e) {
                    self._conn.free(db);
                    BLUE.notice("db["+dbname+"] collect["+colname+"] insert err["+e.message+"]!"); 
                    handle(e, itms);
                    return;
                }
                self._conn.free(db);
                handle(e, itms);
            });
        });
    }
    public select( dbname:string, colname:string,
         filter:any,handle:(err:any,res:any)=>void ){
        let self = this;
        self._conn.conndo(function (err, db) {
            if (err){
                self._conn.free(db);
                    BLUE.notice("db["+dbname+"] collect["+colname+"] select err["+err.message+"]!"); 
                handle(err,null);
                return;
            }
            let dbop:any= db.db(dbname);
            let col = dbop.collection(colname);
            col.find(filter).toArray(function (e: any, res: any) {
                if (e) {
                    self._conn.free(db);
                    BLUE.notice("db["+dbname+"] collect["+colname+"] select err["+e.message+"]!"); 
                    handle(e, null);
                    return;
                }
                self._conn.free(db);
                handle(e, res);
            });
        });
    }

    public delete( dbname:string, colname:string,
        filter:any,handle:(err:any,res:any)=>void ){
        let self = this;
        self._conn.conndo(function (err, db) {
            if (err){
                self._conn.free(db);
                handle(err,null);
                return;
            }
            let dbop:any= db.db(dbname);
            let col = dbop.collection(colname);
            col.deleteOne(filter, function (err: any, res: any) {
                if (err) {
                    self._conn.free(db);
                    handle(err, null);
                    return;
                }
                self._conn.free(db);
                handle(err, null);
            });
        });
    }

    public update( dbname:string, colname:string,
        filter:any, itm:any,handle:(err:any,res:any)=>void ){
        let self = this;
        self._conn.conndo(function (err, db) {
            if (err){
                self._conn.free(db);
                handle(err,null);
                return;
            }
            let dbop:any= db.db(dbname);
            let col = dbop.collection(colname);
            col.updateOne(filter,itm, function (err: any, res: any) {
                if (err) {
                    self._conn.free(db);
                    handle(err, null);
                    return;
                }
                self._conn.free(db);
                handle(err, null);
            });
        });
    }

}

export class DB_item {
    private _fields!:any;
    private _dbname!:string;
    private _colname!:string;
    private _dbop!:DB_handle;
    constructor(conn:DB_CONN,dbname:string,colname:string) {
        //this._url ="mongodb://" +  url;
        this._dbname = dbname;
        this._colname = colname;
        this._dbop = new DB_handle(conn);
    }
    public setdata(fields:any){
        this._fields= fields;
    }
    public setdatas(fields:any){
        this._fields= fields;
    }
    public insert(handle:(err:any,res:any)=>void){
        //let cb = (err:any,d:any)=>{}; 
       
       
       
     
        let self =  this; 
        self._dbop.insert(
            self._dbname
            ,self._colname
            ,self._fields
            ,handle)
    }
}


//查找结果
export class DB_helper {


}

