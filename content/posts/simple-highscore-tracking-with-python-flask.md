+++
title = "Simple highscore tracking with Python / Flask"
date = '2012-12-17'
tags = ["python"]
slug = "simple-highscore-tracking-with-python-flask"
+++

Below is a quick tutorial on how flask web framework might be
used for simple highscore tracking. All of the source code the state game [is now on github][].

This code will accept an AJAX GET or POST at the end of each game so that scores can be tracked and read. Since the use-cases are simple it's easy to write the tests first:

```python
  class StateTestCase(unittest.TestCase):

      def setUp(self):
          self.db_fd, state.app.config['DATABASE'] =
              tempfile.mkstemp()
          state.app.config['TESTING'] = True
          self.app = state.app.test_client()
          state.init_db()

      def tearDown(self):
          os.close(self.db_fd)
          os.unlink(state.app.config['DATABASE'])
```

This above code will create an sqlite db before each test-case and
remove it when completed.

```python
  def test_empty_db(self):
      rv = self.app.get('/d')
      assert json.loads(rv.data) == []

  def test_single_entry(self):
      test_data = {
          'name': 'john doe',
          'score': 1234,
          'time': 1234
      }
      rv = self.app.post('/d', data=test_data)
      assert 'ok' in json.loads(rv.data)
      rv = self.app.get('/d')
      assert json.loads(rv.data) == [test_data]


  def test_multiple_entries(self):
      for score in range(0, 25):
          data = {'name': 'john doe',
                  'score': score,
                  'time': 1234}
          rv = self.app.post('/d', data=data)
          assert 'ok' in json.loads(rv.data)
      rv = self.app.get('/d')
      assert len(json.loads(rv.data)) == 10
```

These three test-cases cover basic functionality of the high-score
tracker:

-   Ensure that if a GET request is made before adding entries an empty
    JSON array is returned.
-   If a single entry is added with a POST ensure that the same results
    are returned with a GET.
-   If there are more than 10 entries added ensure that we only get 10
    back.

For the actual app there isn't much more code than what was written for
the tests.

```python
  @app.route('/d', methods=['GET'])
  def get_scores():
      results = g.db.execute(
          'select name, score, time from hs order by score limit 10')

      q = [dict(zip(['name', 'score', 'time'], [item for item in row]))
           for row in results]

      return json.dumps(q)
```

Retrieve the top 10 scores, return the results as JSON.

```python
  @app.route('/d', methods=['POST'])
  def post_score():
      data = request.form
      if (not re.match('[\s\w]{1,20}$', data['name'])):
          return json.dumps({'error': 'invalid name'})
      if (not re.match('[0-9]+\.?[0-9]*$', data['time'])):
          return json.dumps({'error': 'invalid time'})
      if (not re.match('[0-9]{1,15}$', data['score'])):
          return json.dumps({'error': 'invalid score'})

      g.db.execute('insert into hs (name, score, time) values (?, ?, ?)',
                   [data['name'], data['score'], data['time']])
      g.db.commit()
      return json.dumps({'ok': 'success'})
```

Receive a new score, do some basic input validation and insert the new
high score entry.

Of course it's easy to inject fake high scores with something like this,
abuse it, cheat, etc. But in this case it's just for fun.

  [is now on github]: http://github.com/jarv/thestategame
  [official Flask tutorial]: http://flask.pocoo.org/docs/tutorial/
