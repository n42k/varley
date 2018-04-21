const varley = require('varley')(this)

describe('Varley start up', function() {
  it('should start up with a webpage', function() {
    browser.waitForAngularEnabled(false);
    
    varley.run()

    browser.get('http://localhost:8080')
    expect(browser.getTitle()).toEqual('Varley Game Engine')
  })
})
