class APIFeatures{
    constructor(query, queryStr){
        this.query = query;
        this.queryStr = queryStr;
    }

    search(){
        const keyword = this.queryStr.keyword ? {
            name:{
                $regex: this.queryStr.keyword,
                $options: 'i'
            }
        } : {}

        this.query = this.query.find({...keyword});
        return this;
    }

    filter(){
        const queryCopy = {...this.queryStr};

        const removeFields = ['keyword','limit','page'];
        removeFields.forEach(el=>delete queryCopy[el]);

        let queryStr = JSON.stringify(queryCopy);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, match =>`$${match}`)

        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }

    paginate(resultsPerPage){
        const currentPage =  Number(this.queryStr.page) || 1;
        const skipResults  = resultsPerPage * (currentPage-1); //skip results that have been displayed on the previous page

        this.query = this.query.limit(resultsPerPage).skip(skipResults);
        return this;
    }
}
    module.exports = APIFeatures