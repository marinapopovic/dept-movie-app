
var chai = require('chai')
var chaiHttp = require('chai-http')
var app = require( '../app.js' );

chai.use(chaiHttp);
chai.should();

describe("Movies", () => {
    describe("GET /movies/search?q", () => {
        // Test to for search word 'scream'
        it("should get top 5 movies with search word - scream", (done) => {
            var t = 'scream'
            chai.request(app)
                .get('/movies/search?q=' + t)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('Array');
                    done();
                });
        });
        // Test movie not found
        it("should not find any movie", (done) => {
            var t = 'qw b z';
            chai.request(app)
                .get(`/movies/search?q=` + t)
                .end((err, res) => {
                    res.should.have.status(404);
                    done();
                });
        });
    });
});