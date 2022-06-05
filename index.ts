import axios from 'axios';
import { exit } from 'process';

function print(progress:string){
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.write(progress);
}
function sleep(ms:number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
class AutoTrade{
    maxLots=-1;
    lotPrice=-1;
    activeLots:number[]=[];
    threshold=-1;
    profitRequired=-1;
    coin="";
    price=-1;
    constructor(coin:string,maxLots:number,lotPrice:number,threshold:number,profitRequired:number){
        this.coin=coin;
        this.lotPrice=lotPrice;
        this.maxLots=maxLots;
        this.threshold=threshold;
        this.profitRequired=profitRequired;
        this.updater();
    }
    buy(price:number){
        if(this.activeLots.length==this.maxLots){
            console.log("\nCANT BUY LOTS FULL\n");
        } else {
            this.activeLots.push(price);
            this.activeLots.sort();
            console.log("\nBought at "+price.toString());
        }
        
    }
    sell(priceToSell:number){
        this.activeLots=this.activeLots.filter(price=>price!==priceToSell);
        console.log("\nSold at "+priceToSell.toString());
    }
    updatePrice(){
        if (this.activeLots.length===0){
            this.buy(this.price);
            return;
        }
        let avg=this.activeLots.reduce((acc,p)=>acc+=p/this.activeLots.length,0);
    
        for(let i in this.activeLots){
            if(i=='0')continue;
            if(this.activeLots[i]<this.price&&this.activeLots[i]>avg){
                this.sell(this.activeLots[i]);
            }
        }
        if(this.activeLots[0]-this.price>=this.threshold) this.buy(this.price);
        
        if(this.activeLots.length===1&&((this.price-this.activeLots[0])/this.activeLots[0]*this.lotPrice)>=this.profitRequired){
    
            this.sell(this.activeLots[0]);
            console.log("MAST PROFIT HOGYA RE BABA");
            exit(0);
        }
        const profit=((this.price-avg)/avg)*this.activeLots.length*this.lotPrice;
        print("PRICE: "+this.price.toFixed(4).toString()+" Avg: "+avg.toFixed(4).toString()+" Profit: "+profit.toFixed(4).toString()+" Lots: "+this.activeLots.length.toString()+" Active Lots: "+this.activeLots.toString())
        
    }
    updater = async ()=>{
        while(true){
            await sleep(2000);
            try{
                const value=await axios.get("https://api1.binance.com/api/v3/ticker/price?symbol="+this.coin);
                this.price=parseFloat(value.data.price);
                this.updatePrice()
            } catch(e){
            }
            
        }
    }

}
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
   
  
function main(){
    let coin="BNBBUSD", maxLots=3, lotPrice=1000, profitRequired=20,threshold=0.5;
    readline.question(`Enter Coin (${coin}):` , (input:string) => {
        if(input!=="") coin=input;
        readline.question(`Enter Maximum lots (${maxLots}):`, (input:string) => {
            if(input!=="") maxLots=parseInt(input);
            readline.question(`Enter price of lots (${lotPrice}):`, (input:string) => {
                if(input!=="") lotPrice=parseFloat(input);
                readline.question(`Enter required profit (${profitRequired}):`, (input:string) => {
                    if(input!=="") profitRequired=parseFloat(input);
                    readline.question(`Enter threshold (${threshold}):`, (input:string) => {
                        if(input!=="") threshold=parseFloat(input);
                        // console.log(coin,maxLots,lotPrice,threshold,profitRequired)
                        new AutoTrade(coin,maxLots,lotPrice,threshold,profitRequired)
                        readline.close();
                      });
                  });
              });
          });
      });
      
      
}
main();