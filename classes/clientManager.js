const JLCD = require("../jlcd") //my Helper Module
const mqtt = require('mqtt');

const mqttClient = mqtt.connect("mqtt://localhost")
/**
 * A class to handle all the data of clients
 */
class ClientManager{
    
    constructor(mqttManager){
        this.mqttManager = mqttManager;

        this.serviceLookupTable = {}
        this.clients = [];
        this.startedServices = []


    }
    login(meta){
        if(JLCD.arrayItemAlreadyExists(this.clients,"name", meta)==-1){
            this.clients.push(new Client(meta));
        }

        this.createNewLookupTable()
        console.log(this.clients)
        
    }
    startService(service){
        var client = this.serviceLookupTable[service]
       
        this.clients.forEach(c=>{
            if(c.name == client){
                console.log(c.services)
                console.log(service)
                var serv =  c.services[service]
                if(serv.dependencies.length > 0){
                    serv.dependencies.forEach(dep=>{
                        if(this.startedServices.indexOf(dep)==-1){
                            this.startService(dep)
                        }
                    });
                }
                this.startedServices.push(service)
                c.start(service,this.startedServices)
            }
        })
    }

    /**
     * Creates a Hashtable for the Client - Service Relationship
     * @return {Object} looks something like service1:client1 
     *
     */
    createNewLookupTable(){
        var retObject  = {};
        this.clients.forEach(function(client){
            

            for(const [key,value] of Object.entries(client.services)){
                retObject[key] = client.name
            }
            
        })
        
        this.serviceLookupTable = retObject;
    }
}
/**
 * a Client is a PC or a Language on a PC. 
 * 1 PC could have 2 Clients, one for Nodejs and one for Rust.
 */
class Client{
    constructor(meta){
        this.name = meta.name
        this.ip = meta.ip;
        this.services = this.fillServices(meta.services);
        this.ownServices =  this.fillOwnServices(meta.ownServices);
    }
    fillServices(services){
        var retArr = {}
        services.forEach(s=>{
            retArr[s.name] = new Service(s)
        })
        return retArr
    }
    fillOwnServices(ownServices){
        var retArr = []
        ownServices.forEach(s=>{
            retArr.push(new OwnService(s))
        })
        return retArr
    }
    start(service){
        
        mqttClient.publish(`/clients/${this.name}/start`,service)
    }
}

/**
 * A Service is a application that can be called
 */
class Service{
    constructor(serv){
        this.name = serv.name;
        this.dependencies = serv.dependencies || [];
        this.port = serv.port;
           
    }
}
class OwnService{
    constructor(serv){
        this.name = serv.name;
        this.dependencies = serv.dependencies || [];
        
    }
}

module.exports = ClientManager;