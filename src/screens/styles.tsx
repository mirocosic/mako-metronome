import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },

  indicatorBox: {
    flex: 1,
    maxWidth: 50,
    height: 50, 
    borderRadius: 6,
    borderColor: "lightgray", 
    borderWidth: 1,
  },
  indicatorLevelTop: {
    flex: 1,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  indicatorLevelBottom: {
    flex: 1,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  }
})

export default styles

