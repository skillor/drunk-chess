import { Injectable } from '@angular/core';
import Peer, { DataConnection, PeerConnectOption } from 'peerjs';

@Injectable()
export class RemoteService {

  constructor() { }

  peer?: Peer;
  hostConnections: {[key: string]: DataConnection} = {};
  clientConnection?: DataConnection;
  eventListeners: {[key: string]: (data: any, conn: DataConnection) => void} = {};

  hasHostConnections(): boolean {
    return Object.keys(this.hostConnections).length > 0;
  }

  hasClientConnection(): boolean {
    return !!this.clientConnection;
  }

  hasPeer(): boolean {
    return !!this.peer;
  }

  destroyPeer(): void {
    if (!this.peer) return;
    this.peer.destroy();
    this.clientConnection?.close();
    delete this.clientConnection;
    for (const connId of Object.keys(this.hostConnections)) {
      this.hostConnections[connId].close();
      delete this.hostConnections[connId];
    }
  }

  getPeer(id?: string): Promise<Peer> {
    return new Promise((resolve) => {
      if (this.peer && this.peer.id == id) {
        resolve(this.peer!);
        return;
      }
      this.destroyPeer();
      if (id) {
        this.peer = new Peer(id);
      } else {
        this.peer = new Peer();
      }
      this.peer.once('open', () => {
        this.peer?.on('connection', (conn) => {
          this.setupHostConnection(conn);
        });
        resolve(this.peer!);
      });
    });
  }

  setupHostConnection(conn: DataConnection) {
    this.hostConnections[conn.connectionId] = conn;
    conn.on('data', (data) => {
      this.handleData(data, conn);
    });
    conn.on('error', (err) => {
      console.error(err);
    });
    conn.on('close', () => {
      this.hostConnections[conn.connectionId].close();
      delete this.hostConnections[conn.connectionId];
      console.log('close');
    });
  }

  setupClientConnection(conn: DataConnection) {
    this.clientConnection?.close();
    this.clientConnection = conn;
    conn.on('data', (data) => {
      this.handleData(data, conn);
    });
    conn.on('error', (err) => {
      console.error(err);
    });
    conn.on('close', () => {
      this.clientConnection?.close();
      this.clientConnection = undefined;
      console.log('close');
    });
  }

  connectToPeer(id: string, options: PeerConnectOption): Promise<DataConnection> {
    return new Promise(async (resolve, reject) => {
      const peer = await this.getPeer();
      setTimeout(() => reject(), 2000);
      const conn = peer.connect(id, options);
      conn.once('open', () => {
        this.setupClientConnection(conn);
        resolve(conn);
      });
    });
  }

  handleData(data: any, conn: DataConnection) {
    console.log('got', conn.connectionId, data);
    if (data !== Object(data)) return;
    if (!data.type) return;
    const handler = this.eventListeners[data.type];
    if (handler) handler(data.data, conn);
  }

  broadcast(type: string, data: any) {
    if (!this.send(this.clientConnection, type, data)) {
      this.clientConnection?.close();
      delete this.clientConnection;
    }
    for (const connId of Object.keys(this.hostConnections)) {
      if (!this.send(this.hostConnections[connId], type, data)) {
        this.hostConnections[connId].close();
        delete this.hostConnections[connId];
      }
    }
  }

  send(conn: DataConnection | undefined, type: string, data: any): boolean {
    console.log('wanna send', conn, type, data);
    if (!conn?.open) return false;
    console.log('send', conn, type, data);
    conn.send({type, data});
    return true;
  }

  on(type: string, f: (data: any, conn: DataConnection) => void) {
    this.eventListeners[type] = f;
  }

  waitForResponse(type: string, data: any, timeout = 1000): Promise<any> {
    return new Promise((resolve, reject) => {
      this.on(type, (data) => {
        resolve(data);
      });
      this.broadcast(type, data);
      setTimeout(() => reject(), timeout);
    });
  }
}
