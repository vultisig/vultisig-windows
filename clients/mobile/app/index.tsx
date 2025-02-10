import { Text, View,Button } from "react-native";
import MobileTssModule from "@/modules/mobile-tss/src/MobileTssModule";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
      <Button
        title="Get Derived Public Key"
        onPress={async () => {
          const hexPublicKey = '023e4b76861289ad4528b33c2fd21b3a5160cd37b3294234914e21efb6ed4a452b';
          const hexChainCode = 'c9b189a8232b872b8d9ccd867d0db316dd10f56e729c310fe072adf5fd204ae7';
          const result = MobileTssModule.getDerivedPublicKey(hexPublicKey, hexChainCode, "m/44'/60'/0'/0/0");
          console.log(result);
        }}
      />
    </View>
  );
}
