class Cache {
    constructor(maxLength) {
        this.queue = [];
        this.maxLength = maxLength;
        this.sorter = setInterval(()=>{
            this.queue.sort((a, b) => {
                return a.count-b.count;
            })
        }, 60)
    }

    has(key) {
        let ifExist = this.queue.findIndex((item, index) => {
            if (key === item['key']) return true;
        })
        return ifExist === -1 ? false : true;
    }

    get(key) {
        let ifExist = this.queue.findIndex((item, index) => {
            if (key === item['key']) return true;
        })
        return ifExist === -1 ? null : this.queue[ifExist]['value'];
    }

    set(key, value) {
        if (this.queue.length>this.maxLength) {
            this.queue.shift();
        }
        let ifExist = this.queue.findIndex((item, index) => {
            if (key === item) return true;
        })
        if (ifExist === -1) {
            this.queue.push({ key, value, count: 1 })
            return 0;
        } else {
            this.queue[ifExist].count+=1;
            return this.queue[ifExist].count;
        }
    }

    clear() {
        this.queue = [];
        clearInterval(this.sorter);
    }
}

module.exports = Cache;