import pytest
from run import app

# Tests if the server is working
# As a prerequisite, "python run.py" needs to be run in the console
@pytest.fixture
def client():
    """Create a test client for the Flask app."""
    with app.test_client() as client:
        yield client

def test_index_route(client):
    """Test that the index route returns a response without error."""
    response = client.get('/index')
    assert response.status_code == 200
