from pylon.core.tools import log  # pylint: disable=E0611,E0401
from pylon.core.tools import web

from tools import rpc_tools


class RPC:
    integration_name = 'security_scanner_semgrep'

    @web.rpc(f'dusty_config_{integration_name}')
    @rpc_tools.wrap_exceptions(RuntimeError)
    def make_dusty_config(self, context, test_params, scanner_params):
        """ Prepare dusty config for this scanner """
        result = {'code': '/tmp/code', **scanner_params}
        return "semgrep", result
