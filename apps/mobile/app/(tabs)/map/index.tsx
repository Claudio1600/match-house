import React, { useState, useMemo, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import WebView, { WebViewMessageEvent } from "react-native-webview";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import api from "../../../services/api";
import { LandlordProfile } from "../../../types";
import { colors, radius, spacing } from "../../../utils/theme";

interface PropertiesResponse {
  properties: LandlordProfile[];
}

async function fetchMapProperties(city: string): Promise<LandlordProfile[]> {
  const params: Record<string, string> = {};
  if (city.trim()) params.city = city.trim();
  const { data } = await api.get<PropertiesResponse>("/discover/properties", { params });
  return data.properties ?? [];
}

function buildMapHtml(properties: LandlordProfile[]): string {
  const markers = JSON.stringify(
    properties.map((p) => ({
      id: p.id,
      lat: p.latitude,
      lng: p.longitude,
      rent: Math.round(p.rent),
      title: p.title,
      address: p.address,
      city: p.city,
      rooms: p.availableRooms,
    }))
  );

  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin=""/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin=""></script>
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:100vw;height:100vh;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',sans-serif}
#map{position:fixed;top:0;left:0;width:100vw;height:100vh}
.pin{background:#fff;border:1.5px solid rgba(0,0,0,0.12);border-radius:24px;padding:5px 11px;
  font-size:12px;font-weight:700;color:#111;white-space:nowrap;
  box-shadow:0 2px 8px rgba(0,0,0,0.14);cursor:pointer;transition:all .15s}
.pin.active{background:#111;border-color:#111;color:#fff}
.leaflet-popup-content-wrapper{border-radius:16px;box-shadow:0 6px 24px rgba(0,0,0,0.13);padding:0;overflow:hidden}
.leaflet-popup-content{margin:0;min-width:220px}
.leaflet-popup-tip-container{display:none}
.card{padding:14px 16px 0}
.card-title{font-size:15px;font-weight:600;color:#111;margin-bottom:5px}
.card-row{font-size:12px;color:#666;margin-bottom:3px;display:flex;align-items:center;gap:5px}
.card-price{font-size:18px;font-weight:700;color:#111;margin:6px 0}
.card-btn{display:block;width:calc(100% - 0px);padding:11px;background:#111;color:#fff;border:none;
  font-size:13px;font-weight:600;cursor:pointer;margin:10px 0 0;border-radius:0 0 16px 16px;
  text-align:center;letter-spacing:0.2px}
.leaflet-control-zoom{border:none!important;box-shadow:0 2px 8px rgba(0,0,0,0.12)!important}
.leaflet-control-zoom a{width:36px!important;height:36px!important;line-height:36px!important;
  font-size:18px!important;color:#111!important;background:#fff!important}
</style>
</head>
<body>
<div id="map"></div>
<script>
var data=${markers};
var map=L.map('map',{zoomControl:false}).setView([41.9,12.5],6);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:''}).addTo(map);
L.control.zoom({position:'bottomright'}).addTo(map);

var openPopup=null;
data.forEach(function(p){
  var icon=L.divIcon({className:'',html:'<div class="pin" id="pin-'+p.id+'">€'+p.rent+'</div>',iconAnchor:[28,16]});
  var m=L.marker([p.lat,p.lng],{icon:icon}).addTo(map);
  m.on('click',function(){
    document.querySelectorAll('.pin').forEach(function(el){el.classList.remove('active')});
    var pin=document.getElementById('pin-'+p.id);
    if(pin)pin.classList.add('active');
    if(openPopup)map.closePopup(openPopup);
    openPopup=L.popup({offset:[0,-8],closeButton:false,className:'custom-popup'})
      .setLatLng([p.lat,p.lng])
      .setContent('<div class="card">'+
        '<div class="card-title">'+p.title+'</div>'+
        '<div class="card-row">📍 '+p.address+', '+p.city+'</div>'+
        '<div class="card-row">🏠 '+p.rooms+' '+(p.rooms===1?'stanza disponibile':'stanze disponibili')+'</div>'+
        '<div class="card-price">€'+p.rent+'/mese</div>'+
        '</div>'+
        '<button class="card-btn" onclick="open(\''+p.id+'\')">Vedi profilo completo</button>'
      ).openOn(map);
  });
});
map.on('click',function(){
  document.querySelectorAll('.pin').forEach(function(el){el.classList.remove('active')});
});
function open(id){
  if(window.ReactNativeWebView){window.ReactNativeWebView.postMessage(JSON.stringify({action:'open',id:id}));}
}
</script>
</body>
</html>`;
}

export default function MapScreen() {
  const webViewRef = useRef<WebView>(null);
  const [searchText, setSearchText] = useState("");
  const [activeCity, setActiveCity] = useState("");

  const { data: properties = [], isLoading, refetch } = useQuery({
    queryKey: ["map-properties", activeCity],
    queryFn: () => fetchMapProperties(activeCity),
  });

  const html = useMemo(() => buildMapHtml(properties), [properties]);

  const handleMessage = useCallback((event: WebViewMessageEvent) => {
    try {
      const { action, id } = JSON.parse(event.nativeEvent.data);
      if (action === "open" && id) {
        router.push({ pathname: "/(tabs)/explore/[profileId]", params: { profileId: id } });
      }
    } catch {
      // ignore malformed messages
    }
  }, []);

  const handleSearch = () => {
    setActiveCity(searchText.trim());
  };

  const handleClear = () => {
    setSearchText("");
    setActiveCity("");
  };

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cerca città (es. Milano, Roma…)"
            placeholderTextColor={colors.textMuted}
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={handleClear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch} activeOpacity={0.8}>
          <Text style={styles.searchBtnText}>Cerca</Text>
        </TouchableOpacity>
      </View>

      {/* Count badge */}
      <View style={styles.badge}>
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.textSecondary} />
        ) : (
          <Text style={styles.badgeText}>
            {properties.length} {properties.length === 1 ? "annuncio" : "annunci"}
            {activeCity ? ` a ${activeCity}` : " in Italia"}
          </Text>
        )}
      </View>

      {/* Map */}
      <WebView
        ref={webViewRef}
        source={{ html, baseUrl: "https://unpkg.com" }}
        style={styles.map}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={["*"]}
        mixedContentMode="always"
        allowFileAccess
        allowUniversalAccessFromFileURLs
        allowFileAccessFromFileURLs
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  searchContainer: {
    position: "absolute",
    top: Platform.OS === "android" ? 48 : 56,
    left: spacing.md,
    right: spacing.md,
    zIndex: 10,
    flexDirection: "row",
    gap: spacing.sm,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === "ios" ? 10 : 8,
    gap: spacing.xs,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    padding: 0,
  },
  searchBtn: {
    backgroundColor: colors.textPrimary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  searchBtnText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: "600",
  },
  badge: {
    position: "absolute",
    top: Platform.OS === "android" ? 104 : 112,
    alignSelf: "center",
    zIndex: 10,
    backgroundColor: colors.background,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  badgeText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  map: { flex: 1 },
});
