import { ProcessIF } from "../manager/processManager";
import * as BLUE from "./../utils"; 
import { main } from "../main";
import { ManagerBaseIF } from "../manager/managerBase";
import * as mysql from "mysql"

export class DbManager implements ManagerBaseIF, ProcessIF {
    //----------------------
    public pHolder!: main;
    private _confs: any;
    constructor(holder: main) {
        let self = this;
        self.pHolder = holder;
        self._pools = {};
        self._tableKeys = {};
    }
    //data {host,user,password}
    public init(data: any, cb?: (res: number) => void) {
        this._confs = data;
    }
    //----------------------
    public tagName: string = "DbManager";
    public update(tm: number) {
        BLUE.log("nodemgr update-----------");
    }
    //----------------------
    private _pools: any;
    private getPool(database: string) {
        if (this._pools[database]) {
            return this._pools[database];
        }
        let conf = this._confs;
        var pool = mysql.createPool({
            host: conf.host,
            user: conf.user,
            password: conf.password,
            database: database,
            //database : 'testbase'
        });
        this._pools[conf.database] = pool;
        return pool;
    };

    private _tableKeys: any;
    public regTableKeys(database: string, table_name: string, keys: any) {
        if (!this._tableKeys[database]) {
            this._tableKeys[database] = {};
        }
        var cachekeys = this._tableKeys[database];
        if (cachekeys[table_name]) {
            BLUE.log("reg_table_keys   [" + table_name + "] exsit!!");
            return;
        }
        cachekeys[table_name] = keys;
    }

    private checkSqlSafePerLine(sql: string): string {
        return sql;
    }
    private query(pool: any, sql: string, cb?: any): void {
        pool.getConnection(function (err: any, connection: any) {
            BLUE.log("pool getConnection act!!");
            //var sql_table = "select * from books;"
            if (err) {
                BLUE.log("db querry err!");
                BLUE.log(err);
                cb(err, null, null);
                return;
            }
            connection.query.call(connection, sql,
                function (error: string, results: any, fields: any) {
                    // And done with the connection. 
                    connection.release();
                    // Handle error after the release. 
                    if (error) {
                        BLUE.log("db sql[" + sql + "]  err!");
                        if (cb) {
                            cb(error, null, null);
                        }
                        else {
                            throw error;
                        }
                    }
                    else {
                        BLUE.log("db sql[" + sql + "]  OK!");
                        cb(null, results, fields);
                        // Don't use the connection here, it has been returned to the pool. 
                    }
                });
        });

    }
    public createDb(database: string, cb?: any) {
        let self = this;
        let p = self.getPool("");
        let sql = "create database " + database + ";"
        sql = this.checkSqlSafePerLine(sql);
        this.query(p, sql, cb);
    }

    /**
create table tutorials_tbl(
   tutorial_id INT NOT NULL AUTO_INCREMENT,
   tutorial_title VARCHAR(100) NOT NULL,
   tutorial_author VARCHAR(40) NOT NULL,
   submission_date DATE,
   PRIMARY KEY ( tutorial_id )
);
     */
    //CREATE TABLE table_name (column_name column_type);
    public createDbTable(database: string, sql: string, cb: any) {
        let self = this;
        let useDb = "use " + database + ";"
        useDb = self.checkSqlSafePerLine(useDb);
        let p = self.getPool("");
        self.query(p, useDb, (err: any, p1: any, p2: any) => {
            sql = self.checkSqlSafePerLine(sql);
            self.query(p, useDb, cb);
        });
    }

    private insert(database: string, table_name: string, table_keys: string, values: any[], cb: any) {
        if (values.length <= 0) {
            console.error("insert values len 0");
            if (cb) {
                cb(-1, null, null);
            }
            return;
        }
        var values_str = "";
        for (var i = 0; i < values.length; i++) {
            var val = values[i];
            var v_str = "";
            for (var j = 0; j < val.lenght; j++) {
                v_str += val[j];
                v_str += ",";
            }

            v_str = v_str.substring(0, v_str.length - 1);//去除最右一个逗号
            values_str += "(" + v_str + "),"
        }
        values_str = values_str.substring(0, values_str.length - 1);//去除最右一个逗号
        //var sql_table = "insert into books (table_pt_up_tid,table_pt_down_tid,collect_conf_tp,num_chapters,num_collect,num_read,num_readcnt,name,athour,headimg,last_collect_page) values (0,0,1,0,1,1,1,'name1','athour','aa.jpg','http://xxx.com');"
        var strsql = "insert into " + table_name + "  (" + table_keys + ") values " + values_str + ";";
        console.log("db insert sql[" + strsql + "]");

        let p = this.getPool(database);
        strsql = this.checkSqlSafePerLine(strsql);
        this.query(p, strsql, cb);
    };
    private select(database: string, table_name: string, cnd: any, cb: any) {
        var fcnd = this.cndFormat.call(this, cnd);
        var strsql = "select " + fcnd.keys + " from " + table_name + fcnd.where;
        console.log("db select sql[" + strsql + "]");
        let p = this.getPool(database);
        strsql = this.checkSqlSafePerLine(strsql);
        this.query(p, strsql, cb);
    }
    private updateDB(database: string, table_name: string, values: any[], cnd: any, cb: any) {
        var fcnd = this.cndFormat.call(this, cnd);
        var cols = "";
        var tempArr = [];

        for (let key in values) {
            if (!key || typeof values[key] == "function") continue;
            cols += key + " = " + values[key] + ",";
        }

        cols = cols.substring(0, cols.length - 1);//去除最右一个逗号

        let strsql = "update " + table_name + " set " + cols + fcnd.where;
        console.log(" db update sql[" + strsql + "]");
        let p = this.getPool(database);
        strsql = this.checkSqlSafePerLine(strsql);
        this.query(p, strsql, cb);
    }

    private cndFormat(cnd: any) {
        let ret: any = {};
        let kstr: string = "";
        if ("keys" in cnd) {
            for (let k = 0; k < cnd.keys.length; k++) {
                kstr += (cnd.keys[k] + ",");

            }
            kstr = kstr.substring(0, kstr.length - 1);//去除最右一个逗号
        }
        ret["keys"] = kstr;

        let wstr = " where ";
        if ("where" in cnd) {
            for (let k in cnd.where) {
                let kv = cnd.where[k];
                console.log("k[" + k + "] kv[" + kv + "] type[" + typeof (kv) + "]");
                if (typeof (kv) == "number") {
                    wstr += (k + "=" + kv + " and ");
                }
                else {
                    wstr += (k + "= '" + kv + "' and ");
                }
            }
            wstr = wstr.substring(0, wstr.length - 5);//去除最右一个逗号
        }
        else {
            wstr += " 1=1 ";
        }
        ret["where"] = wstr;
        return ret;
    }

}
