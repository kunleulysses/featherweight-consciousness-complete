export class ApiHandlerService {
    constructor() {
        this.active = false;
    }
    
    async start() {
        this.active = true;
        console.log('Service started');
    }
    
    async stop() {
        this.active = false;
        console.log('Service stopped');
    }
    
    
    handleRequest(req, res) {
        res.json({ status: "ok" });
    }

    authenticate(token) {
        return token === "valid-token";
    }
}